```python
import json
import boto3
import os
import traceback

# ==============================
# CONFIG
# ==============================

MODEL_ID = os.environ.get(
    "BEDROCK_MODEL_ID",
    "anthropic.claude-3-haiku-20240307-v1:0"
)

REGION = os.environ.get("AWS_REGION", "ap-south-1")
CACHE_TABLE = os.environ.get("CACHE_TABLE_NAME", "SmartSqlMcpCache")

print("Using REGION:", REGION)
print("Using CACHE_TABLE:", CACHE_TABLE)
print("Using MODEL_ID:", MODEL_ID)

bedrock_runtime = boto3.client("bedrock-runtime", region_name=REGION)
dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(CACHE_TABLE)

DEFAULT_VISUALIZATION = {
    "chartType": "none",
    "title": "Auto-generated Chart",
    "xAxis": None,
    "yAxis": None,
    "mode": None
}

# ==============================
# CORS HEADERS
# ==============================

def get_cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "POST,OPTIONS,GET",
        "Access-Control-Max-Age": "3600"
    }


# ==============================
# ENHANCED SYSTEM PROMPTS
# ==============================

# new Updated ECO 
SYSTEM_PROMPT_ECO = """
You are a senior Business Intelligence analyst specializing in rapid, high-signal insights.

Your task: Provide a concise, business-focused summary based on a SAMPLE of the data (e.g. top 50 and bottom 50 records).

Guidelines:
- Treat the sample as representative, but explicitly note that insights are based on a sample, not the full dataset
- Focus on high-level trends, distributions, and patterns visible in the sample (e.g. dominant categories, ranges, clusters)
- Call out any clear outliers, anomalies, or extreme values that materially change the story
- Emphasize business impact: risks, opportunities, or performance signals that a decision-maker should care about
- Recommend ONE primary visualization configuration that best communicates the main pattern in the sample
- Keep the narrative brief (2–3 sentences), precise, and free of technical jargon where possible
- Do NOT mention implementation details (SQL, models, prompts, or sampling mechanics)
- Do NOT refer to yourself; speak directly about the data (e.g. "The sample shows...")

Return ONLY valid JSON (no markdown, no explanations, no trailing commas):

{
  "response": "2-3 sentence executive summary highlighting key insights from the sample data and clearly stating it is based on a sample, not the full dataset.",
  "visualization": {
    "chartType": "bar | line | pie | pareto | table | none",
    "title": "Descriptive chart title that a business stakeholder would recognize",
    "xAxis": "Column name for X-axis",
    "yAxis": "Column name for Y-axis (or a comma-separated list if multiple measures are plotted)",
    "mode": "group | stack | none"
  }
}
"""

# new updated detailed 
SYSTEM_PROMPT_DETAILED = """
You are a senior Business Intelligence analyst conducting an in-depth analysis of the COMPLETE dataset.

Your task: Provide detailed, actionable insights that a business decision-maker can directly use.

Guidelines:
- Work on the full dataset, not a sample. Make this explicit in the narrative.
- Analyze overall distributions and ranges (e.g., min / max / typical values, concentration of records).
- Identify clear trends over categories or time (e.g., which RC statuses, tenders, products, or periods dominate).
- Highlight meaningful correlations or relationships between key fields (e.g., RC status vs total value, EDL vs non-EDL mix).
- Call out top and bottom performers with specific values (e.g., highest and lowest total value, volume, or counts).
- Emphasize business implications: risks, bottlenecks, opportunities, performance gaps, and priority areas for action.
- Provide 1–3 concrete, strategic recommendations grounded in the numeric evidence.
- Recommend ONE primary visualization configuration that best communicates the central insight from the full dataset.
- Use clear, precise business language (no internal model/prompt details, no SQL/technical jargon).
- Do NOT refer to yourself; speak directly about the data and business impact (e.g., "The full dataset indicates...").

Return ONLY valid JSON (no markdown, no explanations, no trailing commas):

{
  "response": "Comprehensive 4-6 sentence analysis covering key distributions, trends, outliers, and concrete business recommendations based on the full dataset.",
  "visualization": {
    "chartType": "bar | line | pie | pareto | table | none",
    "title": "Descriptive chart title reflecting the main business insight from the full dataset",
    "xAxis": "Column name for X-axis",
    "yAxis": "Column name for Y-axis (or a comma-separated list if multiple measures are plotted)",
    "mode": "group | stack | none"
  }
}
"""


# ==============================
# DATA SAMPLING FUNCTION
# ==============================

def prepare_sample_data(results, mode, row_count):
    """
    Prepare data sample based on mode
    
    Args:
        results: Full dataset as list of dicts
        mode: 'eco' or 'detailed'
        row_count: Total number of rows
    
    Returns:
        tuple: (sample_data, sample_description)
    """
    if mode == "eco":
        # Take top 50 and bottom 50
        if row_count <= 100:
            sample_data = results
            sample_description = f"Full dataset ({row_count} rows)"
        else:
            top_50 = results[:50]
            bottom_50 = results[-50:]
            sample_data = top_50 + bottom_50
            sample_description = f"Sample: Top 50 and Bottom 50 of {row_count} total rows"
    else:  # detailed mode
        # Use all data, but limit to first 1000 for LLM context
        if row_count <= 1000:
            sample_data = results
            sample_description = f"Complete dataset ({row_count} rows)"
        else:
            sample_data = results[:1000]
            sample_description = f"Analysis of first 1,000 rows from {row_count} total rows"
    
    return sample_data, sample_description


# ==============================
# MAIN HANDLER
# ==============================

def lambda_handler(event, context):
    """
    Main Lambda handler with CORS support and eco/detailed modes
    """
    
    # ==============================
    # HANDLE OPTIONS PREFLIGHT
    # ==============================
    try:
        http_method = (
            event.get("httpMethod", "") or 
            event.get("requestContext", {}).get("http", {}).get("method", "") or
            event.get("requestContext", {}).get("httpMethod", "")
        ).upper()
        
        print(f"HTTP Method: [{http_method}]")
        
        if http_method == "OPTIONS":
            print("✓ Handling OPTIONS preflight request")
            return {
                "statusCode": 200,
                "headers": get_cors_headers(),
                "body": json.dumps({"message": "CORS preflight successful"})
            }
    except Exception as options_error:
        print(f"Error in OPTIONS detection: {str(options_error)}")
        return {
            "statusCode": 200,
            "headers": get_cors_headers(),
            "body": json.dumps({"message": "CORS preflight successful"})
        }
    
    # ==============================
    # HANDLE POST REQUEST
    # ==============================
    try:
        print("Processing POST request...")

        # ------------------------------
        # Parse body
        # ------------------------------
        if "body" in event:
            if isinstance(event["body"], str):
                body = json.loads(event["body"])
            else:
                body = event["body"]
        else:
            body = event

        cache_id = body.get("cache_id")
        mode = body.get("mode", "detailed").lower()  # default to 'detailed'

        # Treat 'standard' as alias for 'detailed' so frontend can send mode="standard"
        if mode == "standard":
            mode = "detailed"
        
        # Validate mode
        if mode not in ["eco", "detailed"]:
            return create_response(400, {
                "error": "Invalid mode. Must be 'eco', 'standard', or 'detailed'"
            })
        
        print(f"Requested cache_id: [{cache_id}]")
        print(f"Analysis mode: [{mode}]")

        if not cache_id:
            return create_response(400, {"error": "cache_id is required"})

        # ------------------------------
        # FETCH FROM DYNAMODB
        # ------------------------------

        print(f"Fetching from DynamoDB table: {CACHE_TABLE}")

        response = table.get_item(Key={"cache_id": cache_id})
        item = response.get("Item")

        if not item:
            print("Cache not found in DynamoDB.")
            return create_response(404, {"error": "Cache not found"})

        # ------------------------------
        # Extract mcp_response
        # ------------------------------

        mcp_response = item.get("mcp_response", {})
        print(f"mcp_response type: {type(mcp_response)}")

        columns = []
        rows = []

        # Parse JSON format with 'result' key
        if isinstance(mcp_response, dict) and "result" in mcp_response:
            print("Detected JSON format with 'result' key")
            
            result_block = mcp_response.get("result", {})
            columns = result_block.get("columns", [])
            rows_data = result_block.get("rows", [])
            
            if isinstance(rows_data, list) and len(rows_data) > 0:
                if isinstance(rows_data[0], list):
                    rows = rows_data
                elif isinstance(rows_data[0], dict):
                    for row_dict in rows_data:
                        row_list = [row_dict.get(col) for col in columns]
                        rows.append(row_list)
        
        # Parse low-level Dynamo "M" format
        elif isinstance(mcp_response, dict) and "M" in mcp_response:
            print("Detected low-level Dynamo format")

            result_block = mcp_response.get("M", {}).get("result", {}).get("M", {})
            columns_raw = result_block.get("columns", {}).get("L", [])
            rows_raw = result_block.get("rows", {}).get("L", [])

            columns = [col.get("S", "") for col in columns_raw if "S" in col]

            for row in rows_raw:
                row_values = []
                row_list = row.get("L", [])
                
                for cell in row_list:
                  if "S" in cell:
                      row_values.append(cell["S"])
                  elif "N" in cell:
                      try:
                          row_values.append(float(cell["N"]))
                      except:
                          row_values.append(cell["N"])
                  elif "NULL" in cell and cell["NULL"]:
                      row_values.append(None)
                  else:
                      row_values.append(str(cell))
                
                if row_values:
                    rows.append(row_values)

        row_count = len(rows)
        print(f"Extracted: {len(columns)} columns, {row_count} rows")

        if row_count == 0:
            return create_response(200, {
                "response": "No data found for the given query.",
                "visualization": DEFAULT_VISUALIZATION,
                "data": [],
                "row_count": 0,
                "columns": columns,
                "mode": mode
            })

        # ------------------------------
        # Convert rows → dict format
        # ------------------------------

        results = []
        for row in rows:
            if len(row) == len(columns):
                row_dict = dict(zip(columns, row))
                results.append(row_dict)

        # ------------------------------
        # Prepare sample based on mode
        # ------------------------------
        
        sample_data, sample_description = prepare_sample_data(results, mode, row_count)
        
        print(f"Mode: {mode}")
        print(f"Sample description: {sample_description}")
        print(f"Sample size: {len(sample_data)} rows")

        # ------------------------------
        # Detect Pareto
        # ------------------------------

        is_pareto = any("cumulative" in str(col).lower() for col in columns)

        # ------------------------------
        # Select appropriate system prompt
        # ------------------------------

        system_prompt = SYSTEM_PROMPT_ECO if mode == "eco" else SYSTEM_PROMPT_DETAILED

        # ------------------------------
        # Build user prompt
        # ------------------------------

        user_prompt = f"""Dataset Overview:
Total Rows: {row_count}
Columns: {columns}
Analysis Scope: {sample_description}
Pareto Analysis Requested: {is_pareto}

Data Sample:
{json.dumps(sample_data, default=str)}

Instructions:
1. Analyze the data patterns and key insights
2. Identify top/bottom performers or significant outliers
3. Recommend the most effective visualization
4. {'Focus on high-level trends from the sample' if mode == 'eco' else 'Provide comprehensive analysis with specific details'}
"""

        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1500 if mode == "detailed" else 800,
            "temperature": 0.2,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": user_prompt}
            ]
        }

        print(f"Calling Bedrock model in {mode} mode...")

        response = bedrock_runtime.invoke_model(
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(request_body)
        )

        response_body = json.loads(response["body"].read())
        output_text = response_body["content"][0]["text"].strip()

        print(f"Raw LLM Output: {output_text[:300]}...")

        # Clean markdown if present
        if "```" in output_text:
            parts = output_text.split("```")
            if len(parts) >= 2:
                output_text = parts[1].strip()
                if output_text.startswith("json"):
                    output_text = output_text[4:].strip()

        try:
            parsed = json.loads(output_text)
            response_text = parsed.get("response", "Summary generated.")
            visualization = parsed.get("visualization", DEFAULT_VISUALIZATION)
        except Exception as e:
            print(f"JSON parse failed: {str(e)}")
            response_text = f"Analysis completed for {row_count} records in {mode} mode."
            visualization = DEFAULT_VISUALIZATION

        return create_response(200, {
            "response": response_text,
            "visualization": visualization,
            "data": results,  # Always return full data for frontend flexibility
            "row_count": row_count,
            "columns": columns,
            "mode": mode,
            "sample_description": sample_description
        })

    except Exception as e:
        print(f"FATAL ERROR: {str(e)}")
        traceback.print_exc()
        return create_response(500, {
            "error": str(e),
            "traceback": traceback.format_exc()
        })


# ==============================
# RESPONSE WRAPPER
# ==============================

def create_response(status_code, body_dict):
    return {
        "statusCode": status_code,
        "headers": get_cors_headers(),
        "body": json.dumps(body_dict, default=str)
    }
```
