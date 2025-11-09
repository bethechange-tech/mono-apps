import type { operations as OpenApiOperations } from './generated';

// Re-export generated OpenAPI types for consumers.
export * from './generated';

export type OpenApiOperation = keyof OpenApiOperations;

type NormalizeStatus<Status extends string | number> = Status extends number
    ? `${Status}`
    : Status;

type OperationDefinition<Operation extends OpenApiOperation> =
    OpenApiOperations[Operation];

type OperationResponses<Operation extends OpenApiOperation> =
    OperationDefinition<Operation> extends {
        responses: infer Responses;
    }
    ? Responses
    : never;

type OperationResponseEntry<
    Operation extends OpenApiOperation,
    Status extends string | number,
> =
    OperationResponses<Operation> extends Record<string, unknown>
    ? OperationResponses<Operation>[NormalizeStatus<Status>]
    : never;

export type OpenApiResponse<
    Operation extends OpenApiOperation,
    Status extends string | number,
    ContentType extends string,
> =
    OperationResponseEntry<Operation, Status> extends {
        content: Record<string, unknown>;
    }
    ? ContentType extends keyof OperationResponseEntry<
        Operation,
        Status
    >["content"]
    ? OperationResponseEntry<Operation, Status>["content"][ContentType]
    : never
    : never;

export type OpenApiJsonResponse<
    Operation extends OpenApiOperation,
    Status extends string | number,
> =
    OperationResponseEntry<Operation, Status> extends {
        content: { "application/json": infer Result };
    }
    ? Result
    : never;

type OperationRequestContent<Operation extends OpenApiOperation> =
    OperationDefinition<Operation> extends {
        requestBody: { content: infer Content };
    }
    ? Content
    : never;

export type OpenApiRequestBody<
    Operation extends OpenApiOperation,
    ContentType extends string,
> =
    OperationRequestContent<Operation> extends Record<string, unknown>
    ? ContentType extends keyof OperationRequestContent<Operation>
    ? OperationRequestContent<Operation>[ContentType]
    : never
    : never;

export type OpenApiJsonRequestBody<Operation extends OpenApiOperation> =
    OpenApiRequestBody<Operation, "application/json">;

