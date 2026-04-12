import { PDFParse } from 'pdf-parse';

export const analyzeResume = async (req, res) => {
    let parser = null;
    try {
        if (!req.file) {
            console.error('Resume analysis failed: No file found in request');
            return res.status(400).json({ message: 'No resume file uploaded' });
        }

        console.log('Analyzing resume file:', req.file.originalname, 'Size:', req.file.size);

        // Parse PDF content using modern PDFParse class
        const dataBuffer = req.file.buffer;
        let text = '';
        
        try {
            parser = new PDFParse({ data: dataBuffer });
            const textResult = await parser.getText();
            text = (textResult.text || '').toLowerCase();
        } catch (pdfErr) {
            console.error('PDF Parsing Error:', pdfErr);
            return res.status(500).json({ message: 'Failed to read PDF content. Is it a valid PDF?', error: pdfErr.message });
        } finally {
            if (parser) {
                await parser.destroy().catch(err => console.error('Error destroying parser:', err));
            }
        }

        // ─── ANALYSIS LOGIC ──────────────────────────────────────────────────
        
        // 1. Skill Extraction
        const skillLibrary = {
            technical: ['javascript', 'typescript', 'react', 'node', 'express', 'postgresql', 'mongodb', 'python', 'java', 'cpp', 'aws', 'docker', 'kubernetes', 'git', 'rest api', 'graphql', 'html', 'css', 'tailwind', 'next.js', 'redux', 'firebase', 'mysql', 'sqlite'],
            soft: ['leadership', 'communication', 'teamwork', 'analytical', 'problem solving', 'project management', 'agile', 'scrum', 'collaboration', 'critical thinking']
        };

        const foundSkills = skillLibrary.technical.filter(skill => text.includes(skill.toLowerCase()));
        const foundSoftSkills = skillLibrary.soft.filter(skill => text.includes(skill.toLowerCase()));

        // 2. ATS Score Calculation (Improved logic)
        let score = 40; // Base score
        if (text.length > 300) score += 10;
        if (foundSkills.length > 2) score += 10;
        if (foundSkills.length > 5) score += 10;
        if (foundSoftSkills.length > 1) score += 5;
        if (foundSoftSkills.length > 3) score += 5;
        if (text.includes('experience')) score += 10;
        if (text.includes('education') || text.includes('college') || text.includes('university')) score += 5;
        if (text.includes('project')) score += 5;
        
        // Cap score at 98
        const atsScore = Math.min(score, 98);

        // 3. Gap Analysis
        const missingTechnical = skillLibrary.technical
            .filter(skill => !foundSkills.includes(skill))
            .slice(0, 5);

        // 4. Recommendation Engine
        const recommendations = [];
        if (foundSkills.length < 5) recommendations.push("Add more technical keywords related to your target job role.");
        if (!text.includes('github') && !text.includes('portfolio') && !text.includes('linkedin')) recommendations.push("Include professional links (GitHub, LinkedIn, or Portfolio) to showcase your work.");
        if (text.length < 500) recommendations.push("Your resume seems a bit brief. Expand on your project contributions and roles.");
        if (foundSoftSkills.length < 2) recommendations.push("Highlight soft skills like 'Leadership' or 'Problem Solving' to provide a balanced profile.");
        if (!text.includes('achieved') && !text.includes('improved') && !text.includes('managed')) recommendations.push("Use more action verbs (e.g., 'Achieved', 'Improved', 'Launched') to describe your impact.");

        // 5. Company Matching
        const companyMatches = [
            { name: "Google", match: Math.max(atsScore - 10, 40), alumni_count: 14, criteria: "High technical weight" },
            { name: "Zoho", match: Math.min(atsScore + 5, 99), alumni_count: 24, criteria: "Product focus" },
            { name: "Amazon", match: Math.max(atsScore - 5, 45), alumni_count: 8, criteria: "Scalability expertise" },
            { name: "Microsoft", match: Math.max(atsScore - 2, 50), alumni_count: 12, criteria: "Enterprise patterns" },
            { name: "Freshworks", match: Math.min(atsScore + 8, 99), alumni_count: 18, criteria: "SaaS & Web skills" }
        ];

        // ─── FINAL REPORT ──────────────────────────────────────────────────
        const detailedReport = {
            ats_score: atsScore,
            summary: `Analysis complete. Found ${foundSkills.length} technical skills and ${foundSoftSkills.length} soft skills. ${atsScore > 80 ? 'Excellent match for current openings!' : (atsScore > 60 ? 'Good foundation, but some optimizations could help.' : 'Significant opportunities for improvement identified.')}`,
            skills_found: foundSkills.map(s => s.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('.')),
            missing_skills: missingTechnical.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
            soft_skills: foundSoftSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
            recommendations: recommendations.length ? recommendations : ["Your resume looks great! Keep it updated with your latest achievements."],
            top_company_matches: companyMatches,
            text_length: text.length,
            parsing_success: true
        };

        res.json(detailedReport);
    } catch (err) {
        console.error('Resume Analysis Critical Error:', err);
        res.status(500).json({ message: 'Error analyzing resume', error: err.message });
    }
};
