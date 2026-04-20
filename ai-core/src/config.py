from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    groq_api_key: str
    gemini_api_key: str

    generator_model: str = "llama-3.3-70b-versatile"
    heavy_model: str = "llama-3.3-70b-versatile"
    light_model: str = "llama-3.1-8b-instant"
    embed_model: str = "models/text-embedding-004"
    whisper_model: str = "whisper-large-v3"
    fallback_model: str = "gemini-2.5-flash-lite"

    ai_core_secret: str

    host: str = "0.0.0.0"
    port: int = 5000


settings = Settings()
