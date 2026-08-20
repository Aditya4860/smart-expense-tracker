from pydantic import BaseModel

class OAuthExchangeRequest(BaseModel):
    code: str
