'use client';
import Image from "next/image";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 p-8 max-w-4xl mx-auto">
      <Image
        src="/heidelai.png"
        alt="Privacy Policy"
        width={100}
        height={100}
        className="rounded-lg mb-8"
      />
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Terms and Conditions of Use</h1>

      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-sm md:text-base text-zinc-700 text-justify">
            https://heidelai.com and any subdomains including client-specific domains are websites,
            services, and platforms that provide AI-powered SaaS solutions. The platform is owned and
            the service provided by HeidelAI Limited (&quot;HeidelAI&quot;, &quot;Supplier&quot;, &quot;us&quot;, &quot;our&quot; and &quot;we&quot; below),
            a limited company registered in England and Wales with company number 16116925 with
            headquarters at Unit 82a James Carter Road, Mildenhall, Bury St. Edmunds, England, IP28 7DE,
            United Kingdom.
          </p>
          <p className="text-sm md:text-base text-zinc-700 text-justify">
            These Terms and Conditions of Use (&quot;Terms&quot;) apply to your (&quot;Customer&quot; and &quot;you&quot; below) use
            of the website at https://heidelai.com (&quot;Website&quot;), any subdomains including client-specific
            domains, and any features or services (&quot;Services&quot;) offered through it, including but not limited to
            Communicative and Understandative products.
          </p>
          <p className="text-sm md:text-base text-zinc-700 text-justify">
            To use the Services, you must agree to these Terms. Please read them carefully. Please note that
            HeidelAI may change or update these Terms. HeidelAI will post any changes to our Website, so
            please revisit periodically because we will assume that you agree with them if you continue to
            use the Services. If you do not agree to these Terms, you must not use our Website or Services.
          </p>
        </section>

        {/* Definitions */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Definitions</h2>
          <div className="space-y-4">
            {[
              { term: "Services", definition: "means the services and products supplied by HeidelAI to the Customer under the Agreement specified below, including Communicative and Understandative products." },
              { term: "Customer", definition: "means any user, person or entity who creates an account and uses HeidelAI Services supplied by HeidelAI under the Agreement." },
              { term: "Visitor", definition: "means any person who is browsing any website where HeidelAI Services are installed." },
              { term: "Agent", definition: "means any person who is employed by Customer to operate the Service." },
              { term: "Concurrent Agents", definition: "means the maximum allowed number of simultaneous Agents within a Customer's organisation that can use the Services at any one time." },
              { term: "End-user", definition: "means any person who uses HeidelAI Services in purpose to communicate with the Customer." },
              { term: "Personal Data/Personal Information", definition: "means personal data within the meaning of the UK GDPR, the Data Protection Act 2018, and other applicable data protection legislation, processed by HeidelAI (or a Sub-processor) on behalf of the Customer pursuant to or in connection with the Agreement." },
              { term: "Confidential Information", definition: "means all information, whether written or oral, provided by the disclosing party to the receiving party and which (i) is known by the receiving party to be confidential; (ii) is marked as or stated to be confidential; or (iii) ought reasonably to be considered by the receiving party to be confidential." },
              { term: "Third Party Service Provider", definition: "means any third party that collects, processes and/or uses Personal Information under the instruction of HeidelAI including any consultant, representative, advisor, or independent contractor (including Sub-processors) who renders services to the Company, a subsidiary, or an affiliate." },
              { term: "Sub-processor", definition: "means entities whose software, goods or services are used by HeidelAI in order to run a business, in particular while providing the Services." },
              { term: "Communicative", definition: "means the multi-platform AI-powered chat solution offered by HeidelAI." },
              { term: "Understandative", definition: "means the AI analytics platform offered by HeidelAI." }
            ].map((item, index) => (
              <div key={index}>
                <h3 className="text-lg md:text-xl font-medium mb-2 text-zinc-900">{item.term}</h3>
                <p className="text-sm md:text-base text-zinc-700 text-justify">{item.definition}</p>
              </div>
            ))}
          </div>
        </section>

        {/* General Statements */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">General Statements</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>
              On principles set out in these Terms and Conditions of Use, HeidelAI Limited renders its
              Services via the following Internet website https://heidelai.com and all relevant subdomains
              including client-specific domains.
            </li>
            <li>
              Accepting these Terms and Conditions of Use is a condition to use Services provided by
              HeidelAI Limited.
            </li>
            <li>All Customers are obliged to observe these Terms and Conditions of Use.</li>
            <li>
              By indicating the Customer&apos;s acceptance towards this Agreement, accessing or using the
              Service, the Customer agrees to be bound by all terms, conditions, notices contained or
              referenced in this Agreement.
            </li>
            <li>
              Please keep in mind that HeidelAI Limited may modify the provisions of these Terms and
              Conditions and only those currently visible on our website are up to date and valid at the time.
              However, modification shall not adversely affect the main provisions of the Agreement such as
              terms of payment or termination of Services. Such changes take place with prior notifying the
              Customer and – if not clearly rejected – are treated as accepted. Therefore, we encourage you
              to periodically familiarise yourself with the currently effective Terms and Conditions version on
              our Internet websites.
            </li>
            <li>
              Further use of Services after additional modifications in the Terms and Conditions have been
              implemented, shall constitute the consent to accept these modifications. Refusal to accept these
              modifications shall preclude the Customer from using the Services.
            </li>
          </ol>
        </section>

        {/* Service Description */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Services Description</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>
              The software used by the Customer in accordance with its application and purpose defined in
              these Terms and Conditions, available on the following Internet website https://heidelai.com and
              all relevant subdomains provided by HeidelAI Limited shall be deemed as Services.
            </li>
            <li>
              The use of any new Services available on aforementioned website, after the Customer has
              accepted the Terms and Conditions shall be subject to its provisions.
            </li>
            <li>
              HeidelAI Limited is exclusively entitled to decide on functionality, the use, subject matter and
              the range of particular Services as well as to cease rendering the Services.
            </li>
            <li>
              HeidelAI is exclusively authorised to decide on the contents and the nature of the software as
              well as to freely add, change or remove particular elements.
            </li>
          </ol>
          <p className="text-zinc-700 font-semibold mb-2">HeidelAI&apos;s Services include but are not limited to:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify pl-4">
            <li>
              Communicative: A multi-platform, AI-powered chat solution that enables businesses to manage
              customer communications across WhatsApp, Telegram, Facebook Messenger, Instagram
              Message, and web applications from a single platform. Communicative uses artificial intelligence to
              interact with customers, assist in sales, provide customer support, and facilitate follow-ups.
            </li>
            <li>
              Understandative: An AI analytics platform that helps businesses understand and improve
              their performance across website metrics, conversation data, advertising campaigns, social
              media engagement, and influencer marketing. Understandative processes real-time data to
              provide actionable insights and recommendations.
            </li>
          </ol>
        </section>

        {/* Access and Use of Services */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Access and Use of Services</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>
              HeidelAI Limited Services are exclusively designated for business use and must be used only
              in accordance with their purpose, application and the Terms and Conditions.
            </li>
            <li>
              HeidelAI Limited Services may be used only in line with its original purpose and aim. Detailed
              guidelines concerning proper use of the Services are enlisted in Acceptable Use Policy section
              below.
            </li>
            <li>
              HeidelAI Limited Services can be accessed solely by logging onto a particular website or
              designated client subdomain.
            </li>
            <li>
              Every Customer is assigned a particular password and login which must not be used by third
              parties without the Customer&apos;s consent. The Customer is responsible for keeping and proper
              protection of their password and login.
            </li>
            <li>The Customer must be at least 18 years of age to be able to register and to access their account.</li>
            <li>
              The Customer undertakes to use the Services in accordance with their use, purpose and in the
              manner consistent with both these Terms and Conditions and provisions of currently effective
              law.
            </li>
            <li>
              The Customer bears full responsibility for all contents, phrases and entries added to the
              network in connection with the use of offered Services.
            </li>
            <li>
              The Customer understands and has become familiar with technical requirements necessary to
              use the Services and has no objections in respect thereof. The Customer is aware of risk and
              threats connected with electronic data transmission.
            </li>
            <li>
              HeidelAI Limited reserves the right to access Customer accounts for the technical and
              administrative purposes and for security reasons. The obtained information in such a manner
              shall not be processed or made available to any third parties unless required by provisions of
              law.
            </li>
            <li>
              The Customers of HeidelAI Limited Service declares that they will not use the Service in a way
              that may constitute a violation of laws.
            </li>
            <li>
              Violation of these Terms and Conditions, applicable laws or generally accepted norms and
              rules shall lead to the termination of this Agreement.
            </li>
          </ol>
        </section>

        {/* Acceptable Use Policy */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Acceptable Use Policy</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>
              This Acceptable Use Policy applies to HeidelAI Limited Services accessible through
              https://heidelai.com and all relevant subdomains, mobile versions and successors URLs related
              to the domain or subdomain.
            </li>
            <li>
              To ensure proper and fluent functioning of the system we hereby declare that HeidelAI
              Limited Customers shall not misuse the Services and product. Consequently, the Customers
              agree not to:
              <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify pl-4">
                <li>
                  hinder functioning of the Services especially in the form of reverse engineering or hacking
                  the Services, attempting to gain unauthorised access to the Services (or any portion
                  thereof) or related systems, networks or data,
                </li>
                <li>
                  use the Services in a way contradictory to these Terms and Conditions and causing a real
                  danger for HeidelAI Limited, for example use the Services to generate or send unsolicited
                  communications or communication judged to be spam, or otherwise cause HeidelAI Limited
                  to become impaired in its ability to send communications on its own or on its Customers&apos;,
                </li>
                <li>
                  misrepresent or mask the origin of any data, content or other information you submit for
                  example by &quot;spoofing&quot;, &quot;phishing&quot;, manipulating headers or other identifiers, impersonating
                  anyone else or access the Services via another Customer&apos;s account without their permission,
                </li>
                <li>use the Services in a way which violates the rights of other individuals or laws,</li>
                <li>
                  promote or advertise products or services different from those belonging to the Customer
                  without legal basis,
                </li>
                <li>allow or encourage anyone else to commit any of the actions listed above.</li>
              </ol>
            </li>
            <li>
              As a condition of using the Services the Customer shall (a) as required by applicable law,
              provide notice to its customers (End-users) and obtain consent if required for use of HeidelAI
              Limited Services as well as for processing and transferring Agents and End-users Personal Data
              to HeidelAI and its Third Party Service Providers (including but not limited to the consent for
              processing sensitive data if required); (b) be responsible for its employees, representatives,
              End-users, and Agents that use the Services; (c) comply with any limitations or restrictions set
              forth in this Agreement, and (d) use the Services only in compliance with applicable law.
            </li>
            <li>
              All information, data, text, software, graphics, commentary, video, messages, or any other
              materials submitted by using the Service, (collectively, &quot;Data&quot;), is the sole responsibility of the
              person from whom such Data originated. Customer is wholly responsible for all downloaded,
              uploaded or otherwise transmitted Data via any of the Services. HeidelAI Limited is not
              responsible for the Data that the Customer submits in a Service.
            </li>
            <li>
              The Customer acknowledges and agrees that HeidelAI may engage Sub-processors in
              connection with the provision of the Services, including without limitation the Processing of the
              Customer&apos;s Personal Data.
            </li>
          </ol>
        </section>

        {/* Trademarks and Copyrights */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Trademarks and Copyrights</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>&quot;HeidelAI&quot;, &quot;Communicative&quot;, and &quot;Understandative&quot; are trademarks of HeidelAI Limited.</li>
            <li>
              HeidelAI Limited states that it has rights to intangible assets in the form of a graphic project of
              offered services and software, website layout, computer software as well as to all company
              signs, symbols and trademarks used within its scope of business activity. These assets are
              protected respectively by applicable copyright laws, laws against unfair competition, trademark
              laws, UK legislation, European Union Law, and other binding international agreements.
            </li>
            <li>
              The HeidelAI Limited websites listed above and all information, content, material, graphics,
              products (including any software) and services included on or otherwise made available to the
              Visitors and the Customer through the aforementioned websites are its exclusive property and
              are covered by applicable copyright laws.
            </li>
            <li>
              Website addresses as well as their contents and layouts are protected by the aforesaid laws.
            </li>
            <li>
              The HeidelAI Limited websites and all information, content, material, products (including any
              software) and services included on or otherwise made available to the Customer through the
              aforementioned websites are provided by &quot;as is&quot; and &quot;as available&quot; basis unless specified
              otherwise in the Agreement. The Customer accepts the fitness of the Services and product for
              the purpose.
            </li>
            <li>
              Prior written consent of HeidelAI Limited is required for any not permitted business and nonbusiness use of offered Services and products. Such consent is required in particular when
              disseminating and publicising particular elements (e.g. photos, films, texts) in other Internet
              services/websites, printed publications, books, multimedia presentations and in other electronic
              media as well as for the disposal or use of its work (adaptations, alterations, modifications).
            </li>
            <li>
              Unauthorised lending, sale, granting of further licenses and sub-licenses to the offered
              products and services by the Customer or any other entity or person without express consent of
              HeidelAI Limited is prohibited. Such acts are not deemed to be the proper use of Services.
            </li>
            <li>
              The Customer must not modify or change the purpose and use of offered Services and
              products. Misleading others as to the existence of cooperation, association, relationship or
              acting on behalf of HeidelAI Limited is prohibited.
            </li>
            <li>
              The Customer acknowledges and agrees that HeidelAI and/or its licensors own all intellectual
              property rights in the Services. Except as expressly stated herein, this agreement does not grant
              the Customer any rights to, or in, patents, copyright, database right, trade secrets, trade names,
              trademarks (whether registered or unregistered), or any other rights or licences in respect of the
              Services or any HeidelAI documentation.
            </li>
          </ol>
        </section>

        {/* Payment */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Payment</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>
              If the Customer wishes to use the Services they will be requested to make a payment
              according to currently effective price list placed on the HeidelAI website, price quote or pricing
              mechanism provided by an approved HeidelAI reseller partner.
            </li>
            <li>
              All payments shall be non-cash transactions, conducted electronically by external
              professional entities.
            </li>
            <li>
              For subscriptions or purchases made on the Website, payment is due on the terms applicable
              to that subscription or purchase as displayed at the point of purchase. For purchases that are
              invoiced by HeidelAI or an approved HeidelAI reseller partner, payment is due on invoice date.
              You will be responsible for all taxes associated with your use of Services that are attributable or
              due by you.
            </li>
            <li>
              HeidelAI is entitled to modify the Fees and/or any other fees payable pursuant to this
              agreement upon 90 days&apos; prior notice to the Customer and the relevant quote shall be deemed
              to have been amended accordingly.
            </li>
            <li>
              If HeidelAI has not received payment within the due date and if no reasonable cause has been
              provided to HeidelAI by the Customer, and without prejudice to any other rights and remedies of
              the Supplier, HeidelAI may, without liability to the Customer, disable the Customer&apos;s password,
              account and access to all or part of the Services and HeidelAI shall be under no obligation to
              provide any or all of the Services while the invoice(s) concerned remain unpaid.
            </li>
            <li>
              Regardless of the billing cycle, HeidelAI provides no refunds or credits, unless specified
              otherwise in the Service Level Agreement, for unused time of the Services if the Customer
              decides to close the account before the end of their subscription period.
            </li>
          </ol>
        </section>

        {/* Data Protection Compliance */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Data Protection Compliance</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>
              HeidelAI Limited is dedicated to protecting data protection and to promote compliance with
              rules set forth by, among others, United Kingdom and European Union data protection
              legislation.
            </li>
            <li>Any observation or breach of data protection may be reported via support@heidelai.com</li>
            <li>
              A separate agreement regarding processing of personal data (the &quot;Data Processor
              Agreement&quot; or &quot;DPA&quot;) regulates HeidelAI&apos;s (the &quot;Data Process or&quot;) processing of personal data
              on behalf of the Customer (the &quot;Data Controller&quot;).
            </li>
            <li>
              Each Customer shall own all right, title and interest in and to all of the Customer&apos;s Data and
              shall have sole responsibility for the legality, reliability, integrity, accuracy and quality of the
              Customer&apos;s Data. The Supplier acknowledges and agrees that it has no right, title or interest in
              and to any Customer&apos;s Data or End User Data.
            </li>
            <li>
              In the event of any loss or damage to Customer&apos;s Data and/or End User Data, the Customer&apos;s
              sole and exclusive remedy shall be for the Supplier to use reasonable commercial endeavours to
              restore the lost or damaged Purchaser&apos;s Data and/or End User Data from the latest back-up
              maintained by the Supplier. The Supplier shall not be responsible for any loss, destruction,
              alteration or disclosure of Purchaser&apos;s Data and/or End User Data caused by any third party
              (except those third parties sub-contracted by the Supplier to perform services related to data
              maintenance and back-up).
            </li>
            <li>
              As emphasized in our service description, HeidelAI maintains 100% data privacy for our
              business clients. This means:
              <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify pl-4">
                <li>Business customer data belongs exclusively to the business customer;</li>
                <li>
                  We process but do not store or use client business data for purposes other than providing
                  our Services;
                </li>
                <li>
                  We do not sell, rent, or share client data with third parties for their marketing purposes.
                </li>
              </ol>
            </li>
          </ol>
        </section>

        {/* Account Closing */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Account Closing</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>The Customer may close its account at any time. Account closing means that the further use of Services with the use of current password and login shall no longer be possible.</li>
            <li>The Customer is responsible for closing their account.</li>
            <li>
              Closing the account by the Customer before the end of settling period for which a payment
              has been made does not obligate HeidelAI Limited to refund the amount for the unused period.
            </li>
            <li>
              HeidelAI Limited reserves the right to close Customer&apos;s account due to gross infringement of
              the provisions of these Terms and Conditions or in the event of illegal use of the offered Services.
            </li>
            <li>
              HeidelAI Limited shall not be liable for any damage suffered by the Customer or the End-user
              arisen due to the suspension or closing the account by the Customer or for other reasons arising
              from the Customer&apos;s fault.
            </li>
          </ol>
        </section>

        {/* AI Features and Limitations */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">AI Features and Limitations</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>
              Our Services utilize artificial intelligence technologies, including machine learning and natural
              language processing, to facilitate automated conversations, analyze conversation intent and
              sentiment, generate insights and recommendations, predict customer behaviors, and automate
              customer segmentation and follow-ups.
            </li>
            <li>
              When our AI makes automated decisions or suggestions, the process is based on data
              provided by your business; the AI operates within parameters set by your configuration; human
              oversight is available for significant decisions; and the AI is continuously improved based on
              performance feedback.
            </li>
            <li>
              While we strive to provide accurate and helpful AI-powered features, we do not guarantee
              that the Services will generate specific results or outcomes for your business. The effectiveness
              of our AI features may vary based on various factors, including the quality and quantity of input
              data, industry context, and specific use cases.
            </li>
            <li>
              You are responsible for reviewing and verifying AI-generated content, recommendations, and
              actions before implementing them. We recommend maintaining appropriate human oversight for
              all AI-powered interactions with your customers.
            </li>
            <li>
              To improve our AI capabilities, we may use anonymized and aggregated data for training
              purposes; we do not use customer-specific business data for general AI training without explicit
              permission; and we implement safeguards to prevent re-identification of individuals in training
              data.
            </li>
          </ol>
        </section>

        {/* Guarantee and Limited Liability */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Guarantee and Limited Liability</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>
              HeidelAI Limited guarantees the highest quality of its operations to ensure accessibility and
              continuity of offered Services and products in accordance with their use and purpose.
            </li>
            <li>
              HeidelAI Limited does not guarantee compatibility of offered Services and products with other
              producers&apos; software. The Customer shall bear responsibility for the choice and consequences
              following from the use of other software including its applicability to the Customer&apos;s objectives.
              Please be aware that due to the complexity of long-distance data transmission there is no
              possibility to ensure an absolute security, accessibility and continuity of the provided Service.
            </li>
            <li>
              HeidelAI Limited stipulates that opinions given by users do not reflect in any possible manner
              Company&apos;s views and opinions. HeidelAI Limited does not monitor or control Customer&apos;s opinions
              on a continual basis; if, however, any opinions in breach with these Terms and Conditions should
              be revealed efforts shall be immediately made to remove them as soon as possible.
            </li>
            <li>
              HeidelAI Limited shall bear no liability in particular for:
              <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify pl-4">
                <li>all negative consequences being the result of force majeure,</li>
                <li>phrases and entries added to the network in connection with the use of offered Services,</li>
                <li>
                  unlawful and inconsistent with these Terms and Conditions Customer&apos;s operations while
                  using offered Services and products,
                </li>
                <li>
                  disturbances in accessibility of offered products and Services not caused by HeidelAI
                  Limited,
                </li>
                <li>
                  damage suffered by the Customer, End-user or any other person or entity arisen due to the
                  suspension or closing the account by the Customer or for other reasons arising from the
                  Customer&apos;s fault,
                </li>
                <li>
                  damage suffered by the Customer as a result of a third party using their data that enable
                  them to access the provided Services and products,
                </li>
                <li>
                  damage following from the Customer or the impossibility to use offered products and
                  Services including damage actually suffered, the loss of expected benefits, data loss,
                  damage or computer crash, the costs of substitute equipment and software, shut-down,
                  company reputation infringement,
                </li>
                <li>
                  consequences of failure to perform or improper performance of obligations undertaken by
                  other users even though such an obligation has been undertaken using offered products
                  and Services.
                </li>
              </ol>
            </li>
          </ol>
        </section>

        {/* Term and Termination */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Term and Termination</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>
              These Terms will commence on the date you first accept them and will continue until all
              subscriptions hereunder have expired or been terminated.
            </li>
            <li>
              The term of your subscription will be specified in your order or as otherwise communicated to
              you. Unless otherwise specified, subscriptions will automatically renew for additional periods
              equal to the expiring subscription term, unless either party gives the other notice of non-renewal
              at least 30 days before the end of the current term.
            </li>
            <li>
              Either party may terminate these Terms and your subscription if the other party materially
              breaches these Terms and fails to cure such breach within 30 days after receiving written
              notice; or becomes the subject of a bankruptcy, insolvency, receivership, liquidation, assignment
              for the benefit of creditors or similar proceeding.
            </li>
            <li>
              Upon termination or expiration of these Terms: (a) all rights granted to you under these Terms
              will cease; (b) you must cease all use of the Services; and (c) you must pay all outstanding fees.
            </li>
          </ol>
        </section>

        {/* Miscellaneous */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Miscellaneous</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-zinc-700 text-justify">
            <li>
              If any reference in these Terms is found to be unenforceable or invalid, that provision will be
              limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain
              in full force and effect and enforceable.
            </li>
            <li>
              The agreement under these Terms is not assignable, transferable or sub-licensable by you
              except with prior written consent.
            </li>
            <li>
              No agency, partnership, joint venture, or employment is created as a result of our agreement
              under these Terms and you do not have any authority of any kind to bind us in any respect
              whatsoever. In any action or proceeding to enforce rights under these Terms, the prevailing
              party will be entitled to recover costs and legal fees.
            </li>
            <li>
              All notices under these Terms will be in writing and will be deemed to have been duly given
              when received, or if transmitted by email, the day after it is sent.
            </li>
            <li>
              The agreement under these Terms will be governed by the laws of England and Wales and
              both parties agree to the exclusive jurisdiction of the courts of England and Wales.
            </li>
          </ol>
        </section>

        {/* Privacy Policy */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Privacy Policy</h2>
          <p className="text-sm md:text-base text-zinc-700 text-justify">
            Principles of Customer privacy protection including Personal Data protection have been
            described in a separate Privacy Policy.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="text-sm md:text-base text-zinc-700 text-justify">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm md:text-base text-zinc-700 text-justify">
              Email: <a href="mailto:support@heidelai.com" className="text-blue-400 hover:text-blue-300">
                support@heidelai.com
              </a>
            </p>
            <p className="text-sm md:text-base text-zinc-700 text-justify">
              Address: HeidelAI Limited, Unit 82a James Carter Road, Mildenhall, Bury St. Edmunds, England,
              IP28 7DE, United Kingdom
            </p>
          </div>
        </section>

        {/* Last Updated */}
        <footer className="mt-12 pt-6 border-t border-zinc-200">
          <p className="text-zinc-500 text-sm">
            Last Updated: March 3, 2025
          </p>
        </footer>
      </div>
    </div>
  );
}