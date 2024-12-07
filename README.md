# frontend
```
cd frontend && npm run dev
```

## NOTE: You will see the outputs on localhost:3000/rtsh2025 (not on localhost:3000)


# backend
```
cd backend && uvicorn main:app --reload
```

# (not recommended) to run both at the same time using a single command (you then only see frontend outputs):
```
cd frontend && npm run dev & cd backend && uvicorn main:app --reload
```


