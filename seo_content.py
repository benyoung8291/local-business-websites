"""Customer-facing service pages and supporting search content. No invented prices or results."""

SERVICES = [
    {
        'slug': 'business-systems-integration',
        'name': 'Business systems integration',
        'title': 'Systems Integration Melbourne | Ben Young',
        'heading': 'Connect your business systems. Enter it once.',
        'description': 'Systems integration for Melbourne small businesses. Connect enquiries, jobs and invoicing, reduce duplicate data entry and keep the software that works.',
        'intro': 'Still copying customer details between your inbox, job software and accounts? I help Melbourne small businesses connect their tools so approved information gets where it needs to go.',
        'guide': 'connect-business-systems',
        'body': '''<h2>A reliable handover between the tools you already use</h2>
<p>You don’t have to replace every system to reduce double-handling. The useful first project is often one connection: an enquiry becoming a job, a completed job reaching the office, or approved information becoming ready for invoicing.</p>
<p>I map that handover with you, check what your platforms support and build a connection around the way your team works. That can involve an API integration, a supported automation platform or a small custom tool. The approach follows the problem and the access your software provides.</p>
<h2>What a first project could cover</h2>
<ul><li><strong>Enquiries into your job system.</strong> Capture the details once, flag missing information and prepare a record for your team to review.</li><li><strong>Job information back to the office.</strong> Pass approved completion details to the next stage without retyping a technician’s notes.</li><li><strong>Customer records that agree.</strong> Decide which system owns each field and how updates are shared.</li><li><strong>Visible failures.</strong> Make a failed transfer something your team can find and resolve, rather than a missing job discovered later.</li></ul>
<p>These are examples to scope, not promises of compatibility with every product. API access, subscription tiers, export formats and platform restrictions all affect what can be connected.</p>
<h2>How we get from a workaround to a working connection</h2>
<ol><li><strong>Follow one real job.</strong> Show me where information starts, where it goes and where somebody copies it.</li><li><strong>Agree the rules.</strong> Choose the source of truth, approvals, duplicate handling and what should happen when data is incomplete.</li><li><strong>Build and test the handover.</strong> Try ordinary jobs, repeated submissions and failed connections before relying on it.</li><li><strong>Make support clear.</strong> Agree who monitors the connection, how errors are handled and how changes to either platform are maintained.</li></ol>
<h2>Does the connection need AI?</h2>
<p>Sometimes. An unstructured email may need interpretation; an approved customer address usually needs a dependable transfer. I can use <a href="/services/ai-workflow-automation/">AI workflow automation</a> for the interpretation step and ordinary integration for moving structured records.</p>
<h2>Start with the handover that wastes the most time</h2>
<p>For our first conversation, bring the names of your systems and one example of the double-handling, with customer details removed. We can meet in Melbourne or talk remotely. I’ll help you work out whether a connection is feasible and what a defined first project would involve.</p>''',
        'faqs': [
            ('Can you connect my current job management and accounting software?', 'I’ll check the exact products and plans first. A supported API or export is usually needed. Some platforms restrict access, so compatibility is confirmed before a build is scoped.'),
            ('Will I need to change software?', 'Not necessarily. The goal is to keep the tools that work and improve the handover. If the platform itself is the problem, we can separately assess a replacement.'),
            ('How much does systems integration cost?', 'The scope depends on the systems, number of handovers, data quality, error handling and ongoing support. We agree the work and its cost before starting; subscription or API fees need to be counted too.'),
        ],
    },
    {
        'slug': 'ai-workflow-automation',
        'name': 'AI workflow automation',
        'title': 'AI Workflow Automation Melbourne | Ben Young',
        'heading': 'Less repetitive admin. More time for the actual job.',
        'description': 'AI workflow automation for Melbourne small businesses and trades. Turn site notes into draft reports, organise enquiries and reduce repetitive office work.',
        'intro': 'If the work is finished but the paperwork keeps you at your desk, there may be a better handover. I build practical AI workflows for Melbourne businesses, with your team checking the parts that matter.',
        'guide': 'ai-workflow-automation',
        'body': '''<h2>Make one recurring task easier</h2>
<p>AI is useful when it has a clear job to do. A first project might prepare a draft report from site notes, extract the details from an enquiry or organise incoming information for the office. We start with the task that takes too long and define what a useful result looks like.</p>
<p>I help scope, build and test that workflow around your existing operation. The aim is less total handling time, including review and corrections—not simply generating more text.</p>
<h2>Examples for small businesses and trades</h2>
<ul><li><strong>Site notes to draft reports.</strong> Turn supplied notes into a consistent format, preserve the originals and flag information that is missing.</li><li><strong>Enquiry sorting.</strong> Prepare a summary of the request and its supplied details so your team can decide what happens next.</li><li><strong>Customer update drafts.</strong> Use approved job information to prepare a message for a person to check before sending.</li><li><strong>Document preparation.</strong> Reduce repetitive formatting and assembly while keeping business judgement with the team.</li></ul>
<p>Each example needs to be tested against your documents and working conditions. AI can misunderstand inputs or produce incorrect details, so important customer-facing outputs need review.</p>
<h2>A pilot with a clear start and finish</h2>
<ol><li><strong>Measure the current task.</strong> Record how often it happens and the time spent preparing, checking and correcting it.</li><li><strong>Agree the boundaries.</strong> Define the source material, required output, reviewer and information the system must not invent.</li><li><strong>Build around real examples.</strong> Include incomplete notes, unusual requests and the difficult cases your team sees.</li><li><strong>Compare the whole workflow.</strong> Check time, errors and usability before extending it to more work.</li></ol>
<h2>Keep your team in control</h2>
<p>We agree what information the workflow can access, which service processes it and who approves the result. The original information should remain available, and the team needs a way to correct an output or complete the task when automation is unavailable.</p>
<p>If the issue is simply moving the same structured details between apps, <a href="/services/business-systems-integration/">systems integration</a> may be the better first step. If the current software cannot support your process, we can assess a <a href="/services/custom-business-apps/">custom business app</a>.</p>
<h2>Show me the task you keep putting off</h2>
<p>Bring an example with private customer information removed. We can meet for coffee in Melbourne or have a call, walk through the task and discuss a manageable first improvement. You don’t need to know which AI tool to choose.</p>''',
        'faqs': [
            ('Do I need to know anything about AI?', 'No. Start with the task, the tools you use and what you want to improve. I’ll help work out whether AI, a normal automation or a process change fits.'),
            ('Can reports and customer messages go out automatically?', 'The starting point is a draft for your team to check. We agree approval requirements around the consequences of a mistake, rather than assuming every output should be sent automatically.'),
            ('Can you work with a trade business?', 'Yes. I focus on practical handovers between the field and the office, including job notes, reports and enquiry information. The workflow needs to work on the devices and in the conditions your team actually uses.'),
        ],
    },
    {
        'slug': 'custom-business-apps',
        'name': 'Custom business apps',
        'title': 'Custom Business Apps Melbourne | Ben Young',
        'heading': 'Business software that fits the way your team works.',
        'description': 'Custom business apps for Melbourne small businesses and trades. Build an internal tool or assess a tailored alternative to your job management software.',
        'intro': 'When every job involves a workaround, another subscription may not fix it. I help Melbourne businesses build custom apps around their own workflows—from a focused internal tool to a tailored job management system.',
        'guide': 'custom-business-apps',
        'body': '''<h2>Start with the work your current software makes awkward</h2>
<p>A custom app makes sense when the way your business works consistently falls outside the tools you pay for. That could be a workflow kept in spreadsheets, job information spread across several apps or a team waiting for a vendor to add a feature.</p>
<p>The first version does not have to replace everything. We can build a smaller tool around one workflow, connect it to existing software and learn from real use before expanding it.</p>
<h2>I’ve made this change in my own business</h2>
<p>We replaced every SaaS app in my business with one in-house app and removed over $80,000 in annual subscriptions. The part I value most is being able to act directly on a team member’s suggestion. Small improvements can go from an idea in the morning to a working change by lunchtime.</p>
<p>That is my own experience, not a forecast for your project. Custom software still has build and running costs, and larger changes need scoping and testing. <a href="/case-study/">Read the story behind the $80,000 figure</a>.</p>
<h2>What we define before building</h2>
<ul><li><strong>The core workflow.</strong> Which tasks the first release must support, who uses it and what stays in existing software.</li><li><strong>The records.</strong> Where customers, jobs, notes and attachments live, and how they relate.</li><li><strong>Access and recovery.</strong> Permissions, backups, data exports and what happens if the system is unavailable.</li><li><strong>Ownership and support.</strong> Source-code access, documentation, maintenance responsibilities and future changes.</li><li><strong>The economics.</strong> Build costs, hosting, AI usage, maintenance and team time alongside subscriptions you may remove.</li></ul>
<h2>A staged build your team can help shape</h2>
<ol><li><strong>Walk through real work.</strong> Identify the workarounds and agree a useful first scope.</li><li><strong>Build a version your team can try.</strong> Test the core journey with realistic records and different user roles.</li><li><strong>Plan the transition.</strong> Check exports, attachments and active jobs before changing the system your team relies on.</li><li><strong>Improve from feedback.</strong> Use the team’s experience to prioritise what comes next.</li></ol>
<h2>Replacing job management software?</h2>
<p>Test the exit before choosing a new system. Your current platform’s export options, historical attachments and active jobs can determine the migration effort. A staged cutover with a rollback plan gives you a way to check the new app before relying on it. Start with the <a href="/guides/replace-job-management-software/">job management replacement checklist</a>.</p>
<p>Sometimes an <a href="/services/business-systems-integration/">integration</a> is enough. We can compare the options over a coffee in Melbourne or a call and choose the smallest change that solves the real problem.</p>''',
        'faqs': [
            ('Can a custom app replace all my subscriptions?', 'It may replace some or many, but that depends on what they do and what your business needs. My own result is not a guarantee. The decision should include running costs, maintenance and the effort of migration.'),
            ('Who owns the app and the data?', 'Source-code access, data ownership, exports, hosting and support responsibilities should be agreed in the project terms before development. We discuss these as part of scoping.'),
            ('How long does a custom business app take?', 'The scope, integrations, data migration and testing determine the timeline. We define a useful first release and agree its delivery plan. The lunchtime example describes small changes in my existing app, not a new app delivered in a few hours.'),
        ],
    },
]

GUIDE_META = {
    'getting-started-with-ai': ('AI for Small Business: Where to Start | Ben Young', 'Not sure where to start with AI? A practical guide for Melbourne small business owners: choose one task, test a pilot and measure the result.'),
    'ai-for-trade-businesses': ('AI for Trade Businesses in Melbourne | Ben Young', 'Practical AI ideas for trade businesses: site notes, job reports, enquiries and office handovers. Learn where automation helps and where people should check.'),
    'connect-business-systems': ('Stop Duplicate Data Entry Between Apps | Ben Young', 'Learn how to connect business systems, choose a source of truth and handle failed transfers. A practical guide to reducing duplicate data entry.'),
    'ai-workflow-automation': ('How AI Workflow Automation Works | Ben Young', 'A practical AI workflow example: turn job notes into a draft report, add human review and measure the whole process before expanding it.'),
    'custom-business-apps': ('Is a Custom Business App Worth It? | Ben Young', 'Compare a custom business app with your current software. Understand scope, ownership, running costs and migration before committing to a build.'),
    'replace-job-management-software': ('Replace Job Management Software? A Guide | Ben Young', 'Keep, connect or replace your job management software? Compare costs, exports, migration and support before changing the system your team relies on.'),
    'ai-consulting-cost': ('AI Consulting Costs for Small Business | Ben Young', 'What affects the cost of AI consulting and automation? Compare scope, integrations, ongoing fees and a useful first pilot before requesting a quote.'),
    'reduce-business-admin': ('How to Reduce Small Business Admin | Ben Young', 'Find the repetitive admin costing your business time. Map a job, choose a first fix and compare process changes, automation, AI and custom software.'),
}

EXTRA_GUIDES = [
('ai-consulting-cost', 'Planning a project', 'What affects the cost of AI consulting?', GUIDE_META['ai-consulting-cost'][1], '''
<p>The useful question is what a specific improvement will cost to build and run. “AI for my business” can mean a short discovery exercise, one automation or a custom operational app. Those are different projects, so a meaningful quote starts with a defined task and outcome.</p>
<h2>Separate the first project from the ongoing costs</h2>
<p>A proposal should make clear what is included in discovery, development, testing and rollout. It should also explain what happens after launch. Hosting, AI usage, automation subscriptions, maintenance and support may continue even if some existing software subscriptions disappear.</p>
<p>I scope work around your actual systems and workflow rather than quoting an invented standard package. We agree the work, cost and success criteria before starting.</p>
<h2>The things that change the scope</h2>
<ul><li><strong>Number of systems.</strong> One handover is different from coordinating several apps that each store part of a job.</li><li><strong>Access to the data.</strong> Supported APIs and clean exports are easier to work with than incomplete records or restricted access.</li><li><strong>Consequences of an error.</strong> A draft report needs different checks from an action that updates operational records.</li><li><strong>Migration.</strong> Historical jobs, attachments, permissions and a cutover plan add work beyond the new features.</li><li><strong>Support expectations.</strong> Monitoring, response arrangements and future changes need to be defined.</li></ul>
<h2>Estimate the value using your own numbers</h2>
<p>Count how often a task happens, the time it takes now and the time that will still be needed to review the output. Multiply the difference by your own cost of staff time. Keep subscription changes separate so you don’t count the same benefit twice.</p>
<p>For example, a hypothetical task done 30 times a week that saves six minutes each time releases three hours a week. That is an illustration of the calculation, not a forecast. Whether those hours become lower costs, extra capacity or a shorter working day depends on the business.</p>
<div class="callout"><p><strong>A useful comparison:</strong> annual cost of the new setup = ongoing software and usage fees + hosting + maintenance and support + the build cost spread over the period you choose. Compare that with the costs and workarounds of the current setup.</p></div>
<h2>What to bring to a scoping conversation</h2>
<ol><li>One task you want to improve, from its trigger to its finished output.</li><li>The names and plans of the systems involved.</li><li>A representative example with private information removed.</li><li>How often the task happens and roughly how long it takes.</li><li>The people who will use the result and the checks they need.</li></ol>
<h2>Choose a first project that can prove its value</h2>
<p>A single <a href="/services/business-systems-integration/">systems integration</a> or <a href="/services/ai-workflow-automation/">AI-assisted workflow</a> may answer the question before you commit to a larger app. Measure it against the old process, including the time spent checking and correcting results.</p>
<p>My own business removed over $80,000 in annual subscriptions after replacing our SaaS tools with one in-house app. That number is subscription spend removed, not net savings after building and running the app. <a href="/case-study/">Read the full context</a>, or <a href="/#contact">tell me about the task you want to improve</a>.</p>'''),
('reduce-business-admin', 'Less paperwork', 'How to reduce admin in a small business', GUIDE_META['reduce-business-admin'][1], '''
<p>If the working day ends with copying job details, chasing missing notes and writing the same updates again, start by following one job through the business. The aim is to find where the extra work is created, then remove the cause rather than adding another tool to manage it.</p>
<h2>Follow one job from enquiry to completion</h2>
<p>Write down where the enquiry arrives, where the customer details are stored, how work is scheduled, how site information returns and what the office needs to finish the paperwork. Put the name of the person and the software beside each handover.</p>
<p>Ask the people doing the work to show you what actually happens. A workaround in someone’s spreadsheet or messages may not appear in the documented process.</p>
<h2>Choose the right kind of fix</h2>
<div class="table-scroll"><table><caption>Match the admin problem to a first option</caption><thead><tr><th scope="col">What keeps happening</th><th scope="col">What to examine first</th></tr></thead><tbody>
<tr><td>The office chases missing details.</td><td>A clearer handover and a form that captures what is needed.</td></tr>
<tr><td>The same details are typed into two apps.</td><td>A supported connection between those systems.</td></tr>
<tr><td>Notes need to become a readable report.</td><td>An AI-assisted draft with a person checking the result.</td></tr>
<tr><td>The team works around the software every day.</td><td>Configuration changes, a small extension or a custom app.</td></tr>
</tbody></table></div>
<h2>Start where the repetition is easiest to measure</h2>
<p>Choose one frequent task with a clear start and finish. Record the time spent, the number of handovers and the errors or corrections. A baseline makes it possible to tell whether the change actually helped.</p>
<p>For a trade business, a first task could be getting completion notes back to the office in one place. After the information is consistently available, a draft report or customer update becomes a more sensible next step.</p>
<h2>Fix the handover before automating it</h2>
<p>If nobody agrees what “job complete” means, an automation can move incomplete work faster. Agree what information is required, who checks it and when the next step should happen. Then decide what software can reliably take over.</p>
<p>A connection should also handle missing data and failed transfers. Someone needs to know when a job has not moved through as expected, with a way to correct and retry it.</p>
<h2>Check the whole team’s workload</h2>
<p>Saving time in the office should not create a longer process for technicians. Test on the phones and computers the team uses, with ordinary jobs and difficult cases. Include time spent reviewing AI drafts and fixing mistakes in the comparison.</p>
<h2>Get help with a practical first step</h2>
<p>I help Melbourne small businesses <a href="/services/business-systems-integration/">connect their systems</a>, <a href="/services/ai-workflow-automation/">automate repetitive admin</a> and <a href="/services/custom-business-apps/">build custom tools</a>. We can start with one task over a coffee or call. You don’t need to know which technology you need; bring the part of the working day you want to improve.</p>'''),
]

HOME_FAQS = [
    ('Where do I start if I know AI could help but don’t know how?', 'Start with one task that takes too long: copying job details, preparing reports or sorting enquiries. Show me how it works today. I’ll help you work out whether AI, a connection between systems or a small custom tool is a practical fit.'),
    ('Do I have to replace my existing software?', 'No. Connecting the software you already use may solve the problem. A custom app is an option when the current setup keeps forcing your team into workarounds.'),
    ('What will it cost?', 'The systems involved, the scope of the change and ongoing support determine the cost. We agree the work and its cost before starting. The guide to <a href="/guides/ai-consulting-cost/">AI consulting costs</a> explains what to compare.'),
    ('Can we meet in Melbourne?', 'Yes. I’m based in Melbourne and happy to meet for coffee to talk through your business. We can also start with a call. <a href="/#contact">Tell me what’s taking too long</a>.'),
]
