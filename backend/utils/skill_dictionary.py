SKILL_ALIASES = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "pg": "PostgreSQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Google Cloud",
    "google cloud platform": "Google Cloud",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "ai": "Artificial Intelligence",
    "dl": "Deep Learning",
    "rest": "REST APIs",
    "restful": "REST APIs",
    "css": "CSS",
    "html": "HTML",
    "sql": "SQL",
    "nosql": "NoSQL",
    "graphql": "GraphQL",
    "docker": "Docker",
    "git": "Git",
    "github": "GitHub",
    "ci/cd": "CI/CD",
    "terraform": "Terraform",
    "redis": "Redis",
    "kafka": "Kafka",
    "spark": "Apache Spark",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "flask": "Flask",
    "django": "Django",
    "fastapi": "FastAPI",
    "express": "Express.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "angular": "Angular",
    "svelte": "Svelte",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "sass": "Sass",
    "scss": "Sass",
    "mysql": "MySQL",
    "sqlite": "SQLite",
    "dynamodb": "DynamoDB",
    "azure": "Azure",
    "heroku": "Heroku",
    "vercel": "Vercel",
    "netlify": "Netlify",
    "linux": "Linux",
    "bash": "Bash",
    "powershell": "PowerShell",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "go": "Go",
    "golang": "Go",
    "rust": "Rust",
    "ruby": "Ruby",
    "php": "PHP",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "r": "R",
    "scala": "Scala",
}


def normalize_skill(skill: str) -> str:
    key = skill.lower().strip()
    return SKILL_ALIASES.get(key, skill.title())


def normalize_skills_list(skills: list[str]) -> list[str]:
    return list(set(normalize_skill(s) for s in skills))


def extract_skills_from_text(text: str) -> list[str]:
    """Extract skills from text using keyword matching — no AI needed."""
    import re
    text_lower = text.lower()
    found = set()
    for alias, canonical in SKILL_ALIASES.items():
        # Match whole words only to avoid false positives (e.g. "r" matching everywhere)
        if len(alias) <= 2:
            pattern = r'\b' + re.escape(alias) + r'\b'
        else:
            pattern = re.escape(alias)
        if re.search(pattern, text_lower):
            found.add(canonical)
    return list(found)
