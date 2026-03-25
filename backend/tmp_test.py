from werkzeug.datastructures import Headers
h = Headers()
h.add("authorization", "Bearer xyz")
print("Authorization" in h)
print(h["authorization"])
