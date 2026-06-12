def require_fields(data, fields):
    return all(field in data for field in fields)
