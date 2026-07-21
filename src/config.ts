export const config = {
    developer: {
        name: "Monish",
        fullName: "Monish Patalay",
        title: "AI Engineer & Full-Stack Developer",
        description: "AI Engineer & Full-Stack Developer building intelligent systems and modern web applications. Passionate about machine learning, computer vision, and shipping production-grade software end to end."
    },
    social: {
        github: "monishpatalay",
        email: "officialmonishh@gmail.com",
        location: "CA, USA"
    },
    about: {
        title: "About Me",
        description: "I'm a Graduate Research Assistant and M.S. Computer Science student at California State University - Los Angeles, building AI-powered products end to end. My work spans CNN-based recognition systems, recommender engines, and full-stack web apps with React, Node.js, and Python. I've mentored 300+ students in Data Structures & Algorithms, shipped production ML models with TensorFlow Serving, and solved 700+ DSA problems along the way. I care about clean architecture, measurable impact, and building things people actually use."
    },
    experiences: [
        {
            position: "Graduate Research Assistant",
            company: "Cal State LA",
            period: "2025 - Present",
            location: "CA, USA",
            description: "Streamlining check-in, assignment, and progress tracking for 60+ students by designing automated resource pipelines in Google Apps Script, cutting reporting time 30% with automated attendance and engagement tracking.",
            responsibilities: [
                "Designed and deployed automated resource pipelines in Google Apps Script",
                "Automated attendance and engagement tracking with Google Sheets workflows",
                "Led email and social outreach campaigns, growing workshop participation 25%",
                "Supported 60+ students across program operations"
            ],
            technologies: ["Google Apps Script", "Google Sheets", "Automation", "Data Workflows"]
        },
        {
            position: "Programming Mentor",
            company: "Smart Interviews",
            period: "2023 - 2024",
            location: "Hyderabad, India",
            description: "Mentored 300+ students in Data Structures & Algorithms across 50+ live sessions, raising average assessment scores 20% through code reviews and mock interviews focused on placement readiness.",
            responsibilities: [
                "Ran 50+ live sessions on DSA problem-solving and code optimization",
                "Conducted code reviews and mock interviews for placement readiness",
                "Built structured problem sets and review sheets adopted program-wide",
                "Mentored students in C++, Python, Java, and JavaScript"
            ],
            technologies: ["C++", "Python", "Java", "JavaScript", "Data Structures", "Algorithms"]
        },
        {
            position: "Machine Learning Intern",
            company: "Defence Research and Development Organisation (DRDO)",
            period: "2023",
            location: "Hyderabad, India",
            description: "Built a CNN-based facial recognition system reaching 94% accuracy on 10k+ images, and deployed it to production via TensorFlow Serving with drift-detection monitoring.",
            responsibilities: [
                "Built a CNN-based recognition system in TensorFlow/OpenCV, cutting inference latency 20%",
                "Engineered TF-IDF features for a content-based movie recommender, improving accuracy 15%",
                "Benchmarked VGG16, ResNet, and custom CNN architectures, tracking runs in MLflow",
                "Deployed the recognition model to production via TensorFlow Serving with drift-detection alerts"
            ],
            technologies: ["Python", "TensorFlow", "OpenCV", "CNNs", "MLflow", "TensorFlow Serving"]
        }
    ],
    education: [
        {
            degree: "M.S., Computer Science",
            institution: "California State University - Los Angeles",
            period: "2024 - 2026",
            location: "CA, USA",
            description: "Pursuing a Master's in Computer Science with a 3.9/4 GPA, focused on machine learning systems and full-stack software engineering.",
            responsibilities: [
                "Maintaining a 3.9/4 GPA",
                "Founded the ICPC Club and reached Hackathon Finalist",
                "Solved 700+ Data Structures & Algorithms problems",
                "Published research on pose estimation using MediaPipe"
            ],
            technologies: ["Machine Learning", "Distributed Systems", "Research", "DSA"]
        },
        {
            degree: "B.Tech, Artificial Intelligence and Machine Learning",
            institution: "CMR Engineering College",
            period: "2020 - 2024",
            location: "Hyderabad, India",
            description: "Completed a Bachelor's in Artificial Intelligence and Machine Learning with a 3.6/4 GPA, building a foundation in data structures, systems, and applied AI.",
            responsibilities: [
                "Maintained a 3.6/4 GPA across core CS and AI/ML coursework",
                "Coursework: Data Structures & Algorithms, Operating Systems, DBMS, Machine Learning, Artificial Intelligence, System Design"
            ],
            technologies: ["Data Structures & Algorithms", "Operating Systems", "DBMS", "Machine Learning", "Artificial Intelligence", "System Design"]
        }
    ],
    projects: [
        {
            id: 1,
            title: "AI Spotify Library Organizer",
            category: "AI / Full Stack",
            technologies: "React, TypeScript, Node.js, Express, Claude Haiku LLM, Spotify API",
            image: "/images/placeholder.webp",
            description: "A full-stack AI music organizer that sorts a user's entire Spotify library from a single natural-language prompt, using a hybrid regex + Claude Haiku LLM pipeline across 7 moods and 16 languages. Includes a 4-source fallback classification pipeline and a persistent cache with batched, auto-retrying API calls."
        },
        {
            id: 2,
            title: "Zyra AI",
            category: "AI Chat App",
            technologies: "Gemini Pro 2.5, React, Context API, Docker, Kubernetes, GitHub Actions",
            image: "/images/placeholder.webp",
            description: "A Gemini Pro 2.5-powered AI chat app deployed to 100+ users, containerized with Docker and Kubernetes. Modular React components with Context API cut response time 35%, with automated CI/CD via GitHub Actions and production logging/alerting for real-time monitoring."
        },
        {
            id: 3,
            title: "Airbnc",
            category: "Full Stack",
            technologies: "MongoDB, Express, React, Node.js (MERN), JWT, Multer",
            image: "/images/placeholder.webp",
            description: "A full-stack MERN booking platform supporting 200+ users, including auth, image uploads, and reservations. Built with 15+ reusable React components and REST APIs for CRUD-heavy booking workflows, boosting UX speed 30% via JWT auth and global state management."
        },
        {
            id: 4,
            title: "Crop Expert",
            category: "AI / ML",
            technologies: "FastAPI, Vite, React, TypeScript, CNN, TensorFlow Serving",
            image: "/images/placeholder.webp",
            description: "A full-stack plant disease detector with a 6-block CNN reaching 94.9% test accuracy across 8 classes on 9,600+ PlantVillage images. Deployed end-to-end on Vercel and Render with an alternate TensorFlow Serving config for versioned rollout."
        }
    ],
    contact: {
        email: "officialmonishh@gmail.com",
        github: "https://github.com/monishpatalay",
        linkedin: "https://www.linkedin.com/in/monish-patalay/"
    },
    skills: {
        develop: {
            title: "AI ENGINEER",
            description: "Building intelligent systems & ML solutions",
            details: "Developing CNN-based recognition systems, recommender engines, and production ML pipelines using Python, TensorFlow, and PyTorch. Experienced with model deployment/serving, monitoring, and MLflow experiment tracking.",
            tools: ["Python", "TensorFlow", "PyTorch", "OpenCV", "scikit-learn", "CNNs", "MLflow", "Model Deployment", "Recommender Systems", "Monitoring"]
        },
        design: {
            title: "FULL-STACK",
            description: "Modern web development & scalable applications",
            details: "Building responsive, production-grade web applications using React, Next.js, Node.js, and Express. Working across MongoDB, MySQL, Redis, and GraphQL with AWS, Docker, and Kubernetes for cloud deployment.",
            tools: ["React", "Next.js", "Node.js", "Express.js", "TypeScript", "MongoDB", "MySQL", "AWS", "Docker", "Kubernetes"]
        }
    },
    // Flat, ordered list. TechStackNew.tsx chunks this into a decreasing
    // pyramid (capped at 12 per row) at render time, so the row shape stays
    // correct however many items Sanity ends up with.
    techStack: [
        { name: "Python", url: "https://python.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
        { name: "JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
        { name: "TypeScript", url: "https://typescriptlang.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
        { name: "C", url: "https://en.cppreference.com/w/c", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
        { name: "C++", url: "https://isocpp.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
        { name: "Java", url: "https://www.java.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
        { name: "SQL", url: "https://en.wikipedia.org/wiki/SQL", image: "https://img.icons8.com/color/48/sql.png" },
        { name: "Kotlin", url: "https://kotlinlang.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" },
        { name: "HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
        { name: "CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
        { name: "Bash", url: "https://www.gnu.org/software/bash/", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg" },
        { name: "React", url: "https://react.dev", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
        { name: "Next.js", url: "https://nextjs.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
        { name: "Bootstrap", url: "https://getbootstrap.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
        { name: "Node.js", url: "https://nodejs.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
        { name: "Express.js", url: "https://expressjs.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
        { name: "Django", url: "https://djangoproject.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" },
        { name: "Flask", url: "https://flask.palletsprojects.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
        { name: "FastAPI", url: "https://fastapi.tiangolo.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" },
        { name: "GraphQL", url: "https://graphql.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
        { name: "TensorFlow", url: "https://tensorflow.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
        { name: "PyTorch", url: "https://pytorch.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg" },
        { name: "Scikit-learn", url: "https://scikit-learn.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg" },
        { name: "OpenCV", url: "https://opencv.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg" },
        { name: "MLflow", url: "https://mlflow.org", image: "https://cdn.simpleicons.org/mlflow" },
        { name: "NumPy", url: "https://numpy.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg" },
        { name: "Tailwind", url: "https://tailwindcss.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
        { name: "Pandas", url: "https://pandas.pydata.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" },
        { name: "MySQL", url: "https://mysql.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
        { name: "PostgreSQL", url: "https://postgresql.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
        { name: "MongoDB", url: "https://mongodb.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
        { name: "Firebase", url: "https://firebase.google.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
        { name: "Redis", url: "https://redis.io", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
        { name: "Docker", url: "https://docker.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
        { name: "Kubernetes", url: "https://kubernetes.io", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
        { name: "Azure", url: "https://azure.microsoft.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
        { name: "Git", url: "https://git-scm.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
        { name: "GitHub", url: "https://github.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
        { name: "GitHub Actions", url: "https://github.com/features/actions", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-plain.svg" },
        { name: "Linux", url: "https://linux.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
        { name: "AWS", url: "https://aws.amazon.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
        { name: "VS Code", url: "https://code.visualstudio.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
        { name: "Vercel", url: "https://vercel.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" },
        { name: "TensorFlow Serving", url: "https://www.tensorflow.org/tfx/guide/serving", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
        { name: "Jupyter", url: "https://jupyter.org", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg" },
        { name: "Figma", url: "https://figma.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
        { name: "Postman", url: "https://postman.com", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" },
        { name: "REST APIs", url: "https://en.wikipedia.org/wiki/REST", image: "https://img.icons8.com/color/48/api-settings.png" },
        { name: "CNNs", url: "https://en.wikipedia.org/wiki/Convolutional_neural_network", image: "https://img.icons8.com/color/48/artificial-intelligence.png" },
        { name: "Photoshop", url: "https://adobe.com/products/photoshop", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg" },
        { name: "Hugging Face", url: "https://huggingface.co", image: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg" },
        { name: "Claude", url: "https://www.anthropic.com/claude", image: "https://cdn.simpleicons.org/anthropic" },
        { name: "Gemini", url: "https://gemini.google.com", image: "https://cdn.simpleicons.org/googlegemini" },
        { name: "Recommender Systems", url: "https://en.wikipedia.org/wiki/Recommender_system", image: "https://img.icons8.com/color/48/filter.png" },
        { name: "MS Office", url: "https://www.microsoft.com/microsoft-365", image: "https://img.icons8.com/color/48/microsoft-office-2019.png" }
    ]
};
