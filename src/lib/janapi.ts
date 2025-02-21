import { env } from "@/env";
import { DailyEmote, Essa, PersonOfTheDay, Prettify } from "@/types";

type ApiRoutes = {
  "/essa": {
    response: Essa[];
  };
  "/essa/:userId": {
    response: Essa;
  };
  "/chart/:userId": {
    response: {
      url: string;
    };
  };
  "/dailyemote/:userId": {
    response: DailyEmote;
  };
  "/person": {
    response: PersonOfTheDay;
  };
  "/message": {
    response: never;
    requestBody: {
      discord_id: string;
      content: string;
    };
  };
  "/summarize": {
    response: {
      output: string;
    };
  };
};

type ApiOptions = {
  baseUrl: string;
  apiKey: string;
};

function createJanapiClient<R extends ApiRoutes>({
  apiKey,
  baseUrl,
}: ApiOptions): ApiClient<R> {
  return {
    async get<K extends keyof R>(
      endpoint: K,
      params?: RouteParams<K & string>,
    ): Promise<R[K] extends { response: infer Res } ? Prettify<Res> : never> {
      let url = new URL(`${baseUrl}${String(endpoint)}`);

      if (params) {
        const endpointWithParams = String(endpoint).replace(
          /:([a-zA-Z_]+)/g,
          (_, key) => String(params[key as keyof typeof params]),
        );
        url = new URL(`${baseUrl}${endpointWithParams}`);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      if (response.headers.get("Content-Type") === "image/png") {
        return response.blob() as Promise<
          R[K] extends { response: infer Res } ? Res : never
        >;
      }

      return response.json() as Promise<
        R[K] extends { response: infer Res } ? Prettify<Res> : never
      >;
    },

    async post<K extends keyof R>(
      endpoint: K,
      body: R[K] extends { requestBody?: infer Req } ? Req : never,
    ): Promise<R[K] extends { response: infer Res } ? Res : never> {
      const response = await fetch(`${baseUrl}${String(endpoint)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.json() as Promise<
        R[K] extends { response: infer Res } ? Prettify<Res> : never
      >;
    },
  };
}

type RouteParams<T extends string> = T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : object;

type ApiClient<R extends ApiRoutes> = {
  get<K extends keyof R>(
    endpoint: K,
    params?: RouteParams<K & string>,
  ): Promise<R[K] extends { response: infer Res } ? Prettify<Res> : never>;

  post<K extends keyof R>(
    endpoint: K,
    body: R[K] extends { requestBody?: infer Req } ? Req : never,
  ): Promise<R[K] extends { response: infer Res } ? Prettify<Res> : never>;
};

const janapi = createJanapiClient({
  baseUrl: env.ESSA_API_URL,
  apiKey: env.ESSA_API_KEY,
});

export { janapi };
