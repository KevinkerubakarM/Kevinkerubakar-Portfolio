export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed w-full bg-background/90 backdrop-blur-sm z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Kevinkerubakar M</span>
            </div>
            <div className="hidden sm:flex items-center space-x-8">
              <a href="#about" className="nav-link">About</a>
              <a href="#experience" className="nav-link">Experience</a>
              <a href="#projects" className="nav-link">Projects</a>
              <a href="#skills" className="nav-link">Skills</a>
              <a href="#contact" className="nav-link">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Hi, I'm <span className="highlight">Kevinkerubakar</span></h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">Software Engineer</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title">About Me</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg mb-6">
                Software Engineer with 2+ years of experience delivering scalable backend systems using TypeScript and AWS. 
                Proven track record in building fault-tolerant distributed architectures and orchestrating workflows with Temporal.io. 
                Skilled in leveraging AI to enhance cloud applications, automate operations, and streamline business processes. 
                Known for creating solutions that improve reliability, performance, and developer efficiency.
              </p>
            </div>
            <div className="card p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Quick Facts</h3>
              <ul className="space-y-3">
                <li>🎓 B.E - Bachelor of Engineering (2019-2023)</li>
                <li>💼 Software Engineer at HP Inc</li>
                <li>🌟 Full Stack Developer</li>
                <li>📍 Tamil Nadu, India</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title">Experience</h2>
          <div className="space-y-8">
            <div className="card p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">Software Engineer</h3>
                  <p className="text-accent">HP Inc • 2023 - Present</p>
                </div>
                <span className="text-sm text-accent">Tamil Nadu, India</span>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-accent mb-2">Use Case</h4>
                <p className="mb-4">Building scalable enterprise solutions using Node.js, TypeScript, AWS cloud technologies and AI Tools</p>
                
                <h4 className="text-lg font-semibold text-accent mb-2">Solution</h4>
                <ul className="space-y-2 mb-4">
                  <li>• Designed & deployed Node.js microservices handling 1B requests/day</li>
                  <li>• Implemented Temporal.io workflows to automate failure retries</li>
                  <li>• Led migration from JavaScript to TypeScript</li>
                  <li>• Took ownership of customer and infrastructure issues</li>
                </ul>
                
                <h4 className="text-lg font-semibold text-accent mb-2">Impact</h4>
                <ul className="space-y-2">
                  <li>• Reduced manual effort by 70% through workflow automation</li>
                  <li>• Reduced runtime errors by 50% through TypeScript migration</li>
                  <li>• Delivered reliable, customer-focused solutions at scale</li>
                  <li>• Contributed to faster delivery of features and smoother tech transitions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title">Featured Projects</h2>
          <div className="grid md:grid-cols-1 gap-8">
            <div className="card p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Durable AI Agent</h3>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-accent mb-2">Use Case</h4>
                <p className="mb-4">Chatbot with natural language speech capabilities to handle customer support inquiries</p>
                
                <h4 className="text-lg font-semibold text-accent mb-2">Solution</h4>
                <ul className="space-y-2 mb-4">
                  <li>• Added voice + text interaction using ElevenLabs and Gemini</li>
                  <li>• Connected to multiple data sources for autonomous issue resolution</li>
                  <li>• Designed scalable and adaptable system architecture</li>
                  <li>• Built using Next.js, Express, AWS, Gemini, ElevenLabs, LangChain</li>
                </ul>
                
                <h4 className="text-lg font-semibold text-accent mb-2">Impact</h4>
                <ul className="space-y-2">
                  <li>• Reduced human support workload by 40%</li>
                  <li>• Improved user engagement by 30%</li>
                  <li>• Autonomously resolved 70% of common issues</li>
                  <li>• System is easily trainable across different domains</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 rounded-lg">
              <h3 className="font-bold mb-4 text-accent">Programming Skills</h3>
              <ul className="space-y-2">
                <li>• Java</li>
                <li>• TypeScript</li>
                <li>• DSA</li>
                <li>• OOPS</li>
              </ul>
            </div>
            
            <div className="card p-6 rounded-lg">
              <h3 className="font-bold mb-4 text-accent">Technologies</h3>
              <ul className="space-y-2">
                <li>• AWS Lambda, SNS, SQS, ECS</li>
                <li>• Git, Temporal.io</li>
                <li>• NextJS, NodeJS, ReactJS</li>
                <li>• ExpressJS, Secret Manager</li>
                <li>• Redis, Docker</li>
                <li>• Azure CI/CD pipeline</li>
              </ul>
            </div>
            
            <div className="card p-6 rounded-lg">
              <h3 className="font-bold mb-4 text-accent">AI Tools</h3>
              <ul className="space-y-2">
                <li>• Github Copilot</li>
                <li>• ChatGPT</li>
                <li>• n8n</li>
                <li>• Gemini</li>
                <li>• RAG</li>
                <li>• LangChain</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title">Get in Touch</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="card p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <p>📧 Email: kevinkerubakaroriginals@gmail.com</p>
                <p>📱 Phone: 6382665634</p>
                <p>📍 Location: Tamil Nadu, India</p>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="space-x-6">
                <a href="https://www.linkedin.com/in/kevinkerubakar-muthuraj" className="btn-primary px-6 py-2 rounded-full inline-block">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
