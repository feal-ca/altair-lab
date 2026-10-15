import ast, json, traceback
import altair as alt

alt.data_transformers.disable_max_rows()

def _is_chart(v):
    return isinstance(v, alt.TopLevelMixin)

def _err(e, line=None):
    return json.dumps({"error": {"type": type(e).__name__, "message": str(e), "line": line}})

def run_user_code(code):
    try:
        tree = ast.parse(code, "<user>")
    except SyntaxError as e:
        return _err(e, e.lineno)
    except ValueError as e:
        return _err(e)
    ns = {"__name__": "__main__"}
    try:
        result = None
        body = tree.body
        if body and isinstance(body[-1], ast.Expr):
            exec(compile(ast.Module(body=body[:-1], type_ignores=[]), "<user>", "exec"), ns)
            result = eval(compile(ast.Expression(body=body[-1].value), "<user>", "eval"), ns)
        else:
            exec(compile(tree, "<user>", "exec"), ns)
        if not _is_chart(result):
            charts = [v for k, v in ns.items() if not k.startswith("_") and _is_chart(v)]
            result = charts[-1] if charts else None
        if result is None:
            return json.dumps({"noChart": True})
        return json.dumps({"spec": json.loads(result.to_json())})
    except BaseException as e:
        frames = traceback.extract_tb(e.__traceback__)
        line = next((f.lineno for f in reversed(frames) if f.filename == "<user>"), None)
        return _err(e, line)
