interface SessionTokenResponse {
  token: string;
  [key: string]: unknown;
}

export const getSessionToken = async (sessionId: string): Promise<string> => {
  // console.log("Requesting session token for sessionId:", sessionId);

  const response = await fetch(`https://api.clerk.com/v1/sessions/${sessionId}/tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CLERK_TOKEN_KEY}`,
    },
    body: JSON.stringify({
      expires_in_seconds: 60
    })
  });
  if (!response.ok) {
    const errorBody = await response.json();
    console.error("Session token request failed", {
      status: response.status,
      statusText: response.statusText,
      body: errorBody
    });
    throw new Error(`Failed to fetch session token: ${response.status} ${response.statusText} - ${JSON.stringify(errorBody)}`);
  }

  const data = await response.json();
  // Return the jwt property, not token
  return data.jwt;
}