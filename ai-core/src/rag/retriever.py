class Retriever:
    """Selects the most relevant corpus samples for a given task.

    Samples are passed in from the backend (already fetched via pgvector cosine
    search). This class does a final re-rank by token budget.
    """

    def __init__(self, max_samples: int = 5, max_chars: int = 3000):
        self.max_samples = max_samples
        self.max_chars = max_chars

    def select(self, samples: list[str], task: str) -> list[str]:
        selected: list[str] = []
        total = 0
        for sample in samples[: self.max_samples]:
            if total + len(sample) > self.max_chars:
                break
            selected.append(sample)
            total += len(sample)
        return selected
