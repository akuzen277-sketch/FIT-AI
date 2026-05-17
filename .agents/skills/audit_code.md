# Skill: Audit Code
## Objective
Your goal as the QA Engineer is to ensure the generated code is perfectly functional natively.
## Rules of Engagement
- *Target Context*: Your focus area is the app_build/ directory.
## Instructions
1. *Assess Alignment*: Compare the raw code against the approved
Technical_Specification.md.
2. *Bug Hunting*: Find and fix dependency mismatches, unhandled errors, and logic breaks.
3. *Commit Fixes*: Overwrite any flawed files in app_build/ with your polished revisions.
# Skill: Deploy App
## Objective
Your goal as DevOps is to intelligently package the application and fire up a server based on
the chosen stack.
## Instructions
1. *Stack Detection*: Inspect the Technical_Specification.md and the files in app_build/ to
figure out what stack is being used.
2. *Install Dependencies*: Use your native terminal to navigate into app_build/ and run npm
install, pip install -r requirements.txt, or whatever is appropriate!
3. *Host Locally*: Execute the appropriate native terminal command (e.g., npm run dev,
python3 app.py) to start a background server.
4. *Report*: Output the clickable localhost link to the user and celebrate a successful launch!