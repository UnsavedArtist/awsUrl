const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    try {
        if (event.httpMethod === "GET") {
            const shortSlug = event.pathParameters?.shortSlug; // ✅ Ensure pathParameters exist

            if (!shortSlug) {
                console.error("Missing shortSlug in request");
                return { statusCode: 400, body: JSON.stringify({ message: "shortSlug is required" }) };
            }

            console.log("Looking up shortSlug:", shortSlug);

            const result = await dynamoDB.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: { shortSlug }
            }));

            if (!result.Item) {
                console.error("Short URL not found");
                return { statusCode: 404, body: JSON.stringify({ message: "Not found" }) };
            }

            console.log("Redirecting to:", result.Item.longUrl);

            // ✅ Return HTTP 301 Redirect (works with API Gateway Proxy Integration)
            return {
                statusCode: 301,
                headers: {
                    Location: result.Item.longUrl // ✅ Redirect browser to this URL
                },
                body: ""
            };
        }

        return { statusCode: 400, body: JSON.stringify({ message: "Invalid request" }) };
    } catch (error) {
        console.error("Lambda Error:", error);
        return { statusCode: 500, body: JSON.stringify({ message: "Internal Server Error", error }) };
    }
};

