from pathlib import Path

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


class PromptAssembler:
    """Loads a .md prompt template and substitutes {{variable}} placeholders."""

    def build(self, template: str, variables: dict[str, str]) -> str:
        path = PROMPTS_DIR / template
        text = path.read_text(encoding="utf-8")
        for key, value in variables.items():
            text = text.replace(f"{{{{{key}}}}}", value)
        return text
