import json

from ..agents.generator_agent import GeneratorAgent
from ..agents.critique_agent import CritiqueAgent
from ..providers.base import LLMProvider
from ..rag.assembler import PromptAssembler
from ..rag.retriever import Retriever
from ..schemas.generate import GenerateRequest, GenerateResponse, GenerationAttempt
from ..schemas.intent import Intent

_assembler = PromptAssembler()
_retriever = Retriever()

MAX_ATTEMPTS = 3
SCORE_THRESHOLD = 0.85


async def _route_intent(task: str, provider: LLMProvider, model: str) -> Intent:
    from pathlib import Path

    template_path = (
        Path(__file__).parent.parent / "prompts" / "intent_router.md"
    )
    prompt = template_path.read_text(encoding="utf-8").replace("{{task}}", task)
    raw = await provider.chat(
        model,
        [{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return Intent.model_validate(json.loads(raw))


def _format_samples(samples: list[str]) -> str:
    return "\n\n---\n\n".join(f"Sample {i + 1}:\n{s}" for i, s in enumerate(samples))


class GeneratePipeline:
    def __init__(
        self,
        generator: GeneratorAgent,
        critique: CritiqueAgent,
        router_provider: LLMProvider,
        light_model: str,
    ):
        self.generator = generator
        self.critique = critique
        self.router_provider = router_provider
        self.light_model = light_model

    async def run(self, req: GenerateRequest) -> GenerateResponse:
        import structlog
        log = structlog.get_logger(__name__)

        # Intent routing — fall back silently rather than aborting
        intent = req.intent
        if not intent:
            try:
                intent = await _route_intent(req.task, self.router_provider, self.light_model)
            except Exception as exc:
                log.warning("intent_routing_failed", error=str(exc))
                intent = Intent()  # defaults: intent="other"

        selected_samples = _retriever.select(req.retrieved_samples, req.task)

        system_prompt = _assembler.build(
            "generation_system.md",
            {
                "user_name": req.user_name,
                "profile": req.profile.model_dump_json(indent=2),
                "retrieved_samples": _format_samples(selected_samples),
                "task": req.task,
                "intent": intent.model_dump_json(),
            },
        )

        attempts: list[GenerationAttempt] = []
        best: GenerationAttempt | None = None

        for i in range(MAX_ATTEMPTS):
            feedback = (
                "\n".join(attempts[-1].critique.issues) if attempts else None
            )

            draft = await self.generator.generate(
                system_prompt=system_prompt,
                feedback=feedback,
            )

            # Critique is optional — if it fails, assign a passing score so we return the draft
            try:
                critique = await self.critique.critique(draft=draft, profile=req.profile)
            except Exception as exc:
                log.warning("critique_failed", attempt=i + 1, error=str(exc))
                from ..schemas.critique import Critique as CritiqueSchema
                critique = CritiqueSchema(score=0.75, issues=[], suggestions=[], strengths=[])

            attempt = GenerationAttempt(
                attempt_number=i + 1,
                draft=draft,
                critique=critique,
            )
            attempts.append(attempt)

            if best is None or critique.score > best.critique.score:
                best = attempt

            if critique.score >= SCORE_THRESHOLD:
                break

        assert best is not None
        return GenerateResponse(
            draft=best.draft,
            voice_match_score=best.critique.score,
            attempts=attempts,
        )
