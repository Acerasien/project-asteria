import sys
import json
import openpyxl

def parse_xlsx(filepath):
    try:
        wb = openpyxl.load_workbook(filepath, data_only=True)
        ws = wb.active
        rows = []
        for row in ws.iter_rows(values_only=True):
            # Convert values to strings, handling None and trimming spaces
            row_vals = [str(val).strip() if val is not None else "" for val in row]
            # Only keep rows that have at least one non-empty cell
            if any(row_vals):
                rows.append(row_vals)
        print(json.dumps({"success": True, "rows": rows}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No filepath provided"}))
        sys.exit(1)
    parse_xlsx(sys.argv[1])
