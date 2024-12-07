# frontend
```
cd frontend && npm run dev
```

# backend
```
cd backend && uvicorn main:app --reload
```

# to run both at the same time using a single command (you then only see frontend outputs):
```
cd frontend && npm run dev & cd backend && uvicorn main:app --reload
```
