import { useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'

const DEFAULT_CONTENT = {
  terms: `## TERMS AND CONDITIONS OF USE

These Terms and Conditions of Use ("Agreement") govern your access to and use of the Brandior platform. By completing registration and clicking "I Agree" or "Create Account", you acknowledge that you have read, understood, and agree to be bound by this Agreement. Your acceptance is recorded electronically with a timestamp and version identifier in Brandior's systems. If you do not agree, you must not register or use the platform. This Agreement was last revised in September 2026.

## 1. DEFINITIONS

The following defined terms apply throughout this Agreement. Defined terms may appear in the singular or plural. "Agreement" means these Terms and Conditions together with the Privacy Policy, Cookie Policy, and Acceptable Use Policy, each incorporated herein by reference and forming one integrated legal instrument. "Brand" means any legal entity or individual registered on the Platform in the capacity of a brand, advertiser, or business seeking creative services from Creators. "Brief" means the written campaign instructions, specifications, scope of work, and requirements submitted by a Brand through the Platform in connection with a proposed Collab. "Chargeback" means any reversal, recall, or payment dispute initiated by a Brand through its bank, card issuer, or financial institution in respect of a Transaction. "Collab" means a creative services engagement between a Brand and a Creator, initiated, documented, funded, and managed through the Platform. "Creator" means any individual registered on the Platform as a content creator, influencer, digital talent, or creative service provider. "Deliverables" means the creative content, media assets, or other output produced by a Creator in performance of a Collab, as specified in the relevant Brief. "Delivery" means the act of a Creator submitting completed Deliverables through the Platform's designated delivery interface, accompanied by verifiable evidence of completion as defined in Clause 7.2. "Effective Date" means the date on which a User completes registration and electronically accepts this Agreement, which acceptance is logged with a timestamp and Agreement version identifier in Brandior's systems, constituting conclusive evidence of acceptance for all legal purposes. "Escrow Account" means the dedicated holding account maintained by the Payment Processor in which Brand Payments are held pending Delivery and Acceptance or resolution of a Dispute. "Expert Determination" has the meaning given in Clause 11. "Force Majeure Event" has the meaning given in Clause 17. "Intellectual Property Rights" means all patents, copyrights, database rights, trade marks, service marks, trade names, design rights, moral rights, know-how, trade secrets, and all other intellectual property rights, whether registered or unregistered, anywhere in the world, including all applications and renewals. "KYC" means the Know Your Customer and identity verification process required under the Money Laundering (Prevention and Prohibition) Act 2022 (as amended), Central Bank of Nigeria (CBN) regulations, and the Payment Processor's compliance framework. "Liquidated Damages" has the meaning given in Clause 13.3. "Payment Processor" means Rubies Finance Limited, a licensed payment service provider regulated by the Central Bank of Nigeria, or such other licensed payment service provider as Brandior may designate by notice. "Platform" means Brandior's web application (app.brandior.africa), mobile applications for Android and iOS, APIs, and all related technology services operated by THE OWL COMPANY. "Platform Fee" means the fee charged by Brandior on each completed Transaction, disclosed to the Brand in the order summary prior to payment confirmation and non-refundable except as expressly stated herein. "Transaction" means the payment of funds by a Brand into the Escrow Account in respect of a specific Collab, and the subsequent release of those funds to the Creator or refund to the Brand. "User" means any Brand or Creator who has completed registration on the Platform and accepted this Agreement.

## 2. NATURE OF THE PLATFORM AND ABSENCE OF AGENCY

2.1 Brandior is a neutral technology intermediary and marketplace. The Platform facilitates discovery, communication, contracting, escrow management, and dispute resolution between Brands and Creators. Brandior is not, and shall not be construed as, a party to any Collab, creative services agreement, or agency arrangement between a Brand and a Creator.

2.2 Brandior does not employ Creators, act as their agent or mandatary, or hold itself out as a provider of creative services. Brandior does not act as agent, representative, or mandatary of any Brand. Neither party may represent to any third party that Brandior is their agent or principal in connection with a Collab.

2.3 Each Collab constitutes a direct contractual relationship exclusively between the Brand and the Creator concerned. The Brief constitutes the scope of that contractual relationship. Brandior's role is strictly limited to providing the technology infrastructure, escrow custody, and Expert Determination services described in this Agreement.

2.4 Nothing in this Agreement shall be construed to create a partnership, joint venture, employment, agency, or franchise relationship between Brandior and any User.

## 3. ELIGIBILITY AND REGISTRATION

3.1 To register on the Platform, a User must: (a) be a natural person of at least 18 years of age or, where a User is a legal entity, be duly incorporated and in good standing under Nigerian law or the law of the User's jurisdiction; (b) have full legal capacity to enter into binding contracts; (c) not be prohibited from using the Platform under any applicable law or any prior Brandior suspension or termination; and (d) provide accurate, current, and complete registration information.

3.2 By completing registration, you represent and warrant that all eligibility conditions in Clause 3.1 are satisfied and will remain satisfied throughout the term of this Agreement. Brandior relies on these representations in providing you access to the Platform.

3.3 You are solely responsible for maintaining the confidentiality of your login credentials and for all activity occurring under your account. You shall notify Brandior immediately at support@brandior.africa upon becoming aware of any unauthorised access to your account. Brandior shall not be liable for any loss arising from your failure to maintain credential security.

3.4 You may not register, or assist any third party to register, more than one account on the Platform. Registration of duplicate accounts to evade a suspension, ban, or pending investigation is a material breach of this Agreement.

## 4. BRAND OBLIGATIONS AND WARRANTIES

4.1 By registering as a Brand and by initiating any Collab, you represent, warrant, and covenant that you will: (a) prepare and submit a clear, accurate, complete, and lawful Brief for each Collab; (b) fund the Escrow Account in full, in the amount agreed in the Collab order, before the Creator commences work; (c) review Deliverables promptly upon Delivery and either approve them or raise a Dispute within the timeframes set out in Clause 11; (d) not request work outside the agreed scope of the Brief without creating a separate new Collab order; (e) not instruct Creators to produce content that is unlawful, defamatory, discriminatory, obscene, or that infringes any third-party Intellectual Property Right; (f) not share or solicit personal contact details from Creators for the purpose of circumventing the Platform's escrow or fee structure; and (g) ensure that any product, service, or brand being promoted in a Brief complies with all applicable Nigerian laws, including the Federal Competition and Consumer Protection Act 2018, ARCON Advertising Standards, and the Standards Organisation of Nigeria Act.

4.2 Brief Intellectual Property Warranty. You warrant that your Brief and all material and references contained therein are free of third-party Intellectual Property Rights that you are not licensed to use. If any Creator produces Deliverables in good-faith reliance on your Brief and a third party makes an Intellectual Property claim against that Creator arising directly from instructions you provided in the Brief, you shall, at your own cost, defend, indemnify, and hold harmless that Creator against such claim, and shall indemnify Brandior for any costs incurred by Brandior in connection with the same.

4.3 Chargeback Prohibition. By funding the Escrow Account, you irrevocably agree not to initiate a Chargeback in respect of any Transaction where: (a) the Collab has commenced (i.e., the Creator has received the Brief and confirmed acceptance); or (b) Deliverables have been submitted; or (c) escrowed funds have been released pursuant to this Agreement or an Expert Determination. A Chargeback initiated in breach of this Clause constitutes a material breach of this Agreement. Brandior shall contest all such Chargebacks by submitting full Transaction evidence to the Payment Processor, the relevant card scheme, and, where necessary, the Central Bank of Nigeria. You remain personally liable for the full Transaction amount plus a recovery fee of 15% of the Transaction value and all reasonable legal and administrative costs incurred by Brandior in contesting the Chargeback.

## 5. CREATOR OBLIGATIONS AND WARRANTIES

5.1 By registering as a Creator and by accepting any Collab, you represent, warrant, and covenant that you will: (a) deliver Deliverables that conform to the agreed Brief in scope, quality, and within the agreed timeline; (b) produce only original work and not incorporate any third-party material in Deliverables without holding a valid licence to do so; (c) comply with all applicable platform community standards and advertising disclosure requirements of Meta, TikTok, YouTube, X Corp, Snapchat, and any other platform on which Deliverables are published; (d) comply with the Advertising Regulatory Council of Nigeria (ARCON) Code of Advertising Practice and all applicable ARCON guidelines, and clearly disclose all paid partnerships as required by law; (e) not solicit or accept payment from a Brand for a Collab initiated through the Platform by means other than the Platform's escrow system; (f) maintain accurate and current profile information including your rate card, portfolio, and declared audience metrics; (g) complete KYC verification before withdrawing any funds from your wallet; and (h) not misrepresent your follower counts, engagement rates, audience demographics, or creative capabilities.

5.2 By accepting a Collab, you acknowledge that you have reviewed the Brief and that you have the skills, rights, and capacity required to deliver the Deliverables specified. You shall communicate any inability to deliver — whether by reason of illness, technical failure, or any other cause — to the Brand through the Platform's messaging system without delay and before the agreed deadline.

## 6. PLATFORM FEE AND MINIMUM TRANSACTION

6.1 Brandior charges a Platform Fee on each completed Transaction. The applicable Platform Fee is disclosed to the Brand in the order summary prior to payment confirmation. The Brand's payment of the Escrow amount constitutes acceptance of the Platform Fee.

6.2 Platform Fees are non-refundable once a Collab has commenced, except where a Dispute is resolved entirely in the Brand's favour and the escrow funds are returned in full to the Brand, in which case Brandior may, at its discretion, credit the Platform Fee to the Brand's account for use on a future Transaction.

6.3 The minimum Transaction value on the Platform is ₦20,000. Brandior may revise this minimum by giving Users 30 days' notice by email.

6.4 All amounts on the Platform are denominated in Nigerian Naira (₦). Brandior does not support foreign currency transactions except as may be expressly introduced by future Platform updates with appropriate notice.

## 7. PAYMENTS, ESCROW, AND DELIVERY

7.1 Escrow Structure. The Brand shall fund the Escrow Account in full before the Creator commences work. Escrowed funds are held by the Payment Processor on behalf of the parties and shall be released only in accordance with this Agreement. Brandior does not hold escrow funds directly; they are held by the Payment Processor subject to the payment processing agreement between Brandior and the Payment Processor and applicable CBN regulations.

7.2 Valid Delivery. Delivery is effected only when: (a) the Creator has submitted the completed Deliverables through the Platform's designated delivery interface; and (b) the submission includes verifiable evidence of completion, being the actual Deliverable file, a direct link to the published content, or such other proof as the Platform specifies for the relevant content type. A change of Collab status alone, without accompanying Deliverable evidence, does not constitute Delivery and does not trigger the Auto-Release clock under Clause 7.3.

7.3 Auto-Release. Where a Brand does not approve Deliverables or raise a Dispute within 7 calendar days of a valid Delivery, the Platform will automatically release the escrowed funds to the Creator. By funding the Escrow Account, the Brand irrevocably authorises this auto-release mechanism and acknowledges that inaction within 7 days of valid Delivery constitutes acceptance of the Deliverables.

7.4 Refunds. Escrowed funds shall be returned to the Brand only where: (a) the Creator declines the Collab offer before commencing work; (b) the Creator fails to achieve valid Delivery within the agreed timeline, and no agreed extension has been communicated through the Platform; or (c) an Expert Determination under Clause 11 resolves in the Brand's favour and directs a full or partial refund.

7.5 Chargeback Consequences. The consequences of a Chargeback initiated in breach of Clause 4.3 are set out in Clause 4.3. Brandior will submit full Transaction evidence — including the executed Brief, Delivery evidence, any Expert Determination, and Platform communications — to the Payment Processor, card scheme, and CBN in contesting any such Chargeback.

7.6 Payment Processor Insolvency or Regulatory Action. If the Payment Processor is unable to process or return escrowed funds as a result of its insolvency, regulatory suspension, or a CBN or government order, Brandior will use all commercially reasonable efforts to recover and return escrowed funds to the rightful party. Brandior is not liable for loss of escrowed funds caused by the insolvency or regulatory action of a third-party Payment Processor operating under CBN supervision, provided Brandior was not negligent in its selection or continued engagement of that Payment Processor.

7.7 Taxes. Each User is solely responsible for determining and meeting their obligations with respect to income tax, withholding tax, value-added tax, and any other applicable tax or levy arising from amounts received through the Platform. Brandior does not provide tax advice and does not withhold or remit taxes on behalf of any User.

## 8. KYC AND IDENTITY VERIFICATION

8.1 Creators must complete KYC verification before withdrawing funds from their wallet. KYC is conducted by the Payment Processor in accordance with the Money Laundering (Prevention and Prohibition) Act 2022 (as amended) and applicable CBN Know Your Customer guidelines.

8.2 Brandior may independently require Users to provide identity documents, proof of business registration, or other information where required for platform integrity, regulatory compliance, or fraud prevention. Failure to provide required documents within the timeframe specified by Brandior may result in account suspension.

8.3 By submitting KYC documents through the Platform, you consent to their processing by the Payment Processor and, where required by law, disclosure to relevant Nigerian regulatory authorities.

8.4 Brandior is not liable for delays in payment release caused by a User's failure to submit accurate or complete KYC documentation.

## 9. INTELLECTUAL PROPERTY

9.1 Creator's Retained Rights. Subject to Clause 9.2, Creators retain all underlying Intellectual Property Rights in Deliverables. No assignment of copyright or other Intellectual Property Rights from Creator to Brand is effected by this Agreement or by a Collab, except where an express written assignment is agreed in the Brief and confirmed in writing between the parties.

9.2 Default Licence. Upon full release of escrowed funds to the Creator in respect of a Collab, the Brand receives a non-exclusive, royalty-free, non-transferable, non-sublicensable licence to use the Deliverables solely for the campaign purpose described in the Brief, for the duration of that campaign, in the geographic market or markets specified in the Brief. This default licence does not permit the Brand to: (a) use the Deliverables in any campaign or for any product not described in the Brief; (b) alter or modify the Deliverables in a manner that misrepresents the Creator's work; or (c) sublicense or assign use rights to any third party.

9.3 Full Buyout. If the Brand requires perpetual, unlimited, transferable, or sublicensable rights over the Deliverables, this must be agreed explicitly in the Brief as a "Full Buyout", priced and accepted by the Creator before the Collab commences. Without an express Full Buyout provision in the Brief, the default licence in Clause 9.2 applies. Brandior is not responsible for disputes arising from a Brand's use of Deliverables beyond the agreed licence scope.

9.4 Brandior Platform IP. All Intellectual Property Rights in the Brandior Platform — including source code, software, algorithms, designs, trade marks, logos, trade names, and brand identity — are the exclusive property of THE OWL COMPANY. Nothing in this Agreement grants any User a licence to copy, reproduce, reverse-engineer, decompile, distribute, or create derivative works from Brandior's platform, code, or brand assets. Unauthorised use may constitute infringement under the Copyright Act (Cap C28 LFN 2004) and the Trade Marks Act (Cap T13 LFN 2004) and will be pursued accordingly.

9.5 User Content Licence to Brandior. By uploading content to your profile, portfolio, or any part of the Platform, you grant Brandior a non-exclusive, royalty-free, worldwide, perpetual licence to display, reproduce, and use that content for the purpose of operating, promoting, and marketing the Platform, including in marketing materials and case studies (without identifying you by name without your consent).

## 10. CONFIDENTIALITY

10.1 Each User acknowledges that Briefs, Deliverables, and the content of Platform communications may contain commercially sensitive information belonging to the other party. Each User agrees to treat such information as confidential, not to disclose it to any third party without the prior written consent of the disclosing party, and to use it solely for the purpose of performing or evaluating the relevant Collab.

10.2 This obligation of confidentiality does not apply to information that: (a) is or becomes publicly available through no fault of the receiving party; (b) the receiving party can demonstrate was already known to it before disclosure; or (c) is required to be disclosed by law, court order, or regulatory authority, provided prompt prior notice is given to the disclosing party where legally permitted.

## 11. DISPUTE RESOLUTION — EXPERT DETERMINATION AND ARBITRATION

11.1 Agreement to Expert Determination. By registering on the Platform and accepting this Agreement, each User irrevocably agrees that disputes arising from a Collab — including disputes about delivery quality, scope, non-delivery, or refund entitlement — shall be resolved by Expert Determination by Brandior as set out in this Clause 11. This Expert Determination mechanism is a contractually agreed dispute resolution procedure, binding on both parties as a matter of contract under Nigerian law, and not an arbitration.

11.2 Raising a Dispute. A dispute must be raised through the Platform's built-in dispute system within the following periods from the date of valid Delivery or the agreed deadline (whichever is earlier): (a) General disputes (delivery quality, scope, or non-delivery): within 7 calendar days; (b) Intellectual Property infringement claims or fraud and misrepresentation claims: within 30 calendar days. Claims submitted after the applicable period will be rejected and the relevant escrow funds released to the Creator. Both parties must submit all relevant evidence — including the Brief, Delivery evidence, Platform communications, and any supporting documentation — within 5 calendar days of the dispute being raised.

11.3 Expert Determination Process. Brandior will review all submitted evidence and issue a written Determination within 10 business days of the close of the evidence submission period. The Determination will specify how escrowed funds are to be distributed between the parties. Brandior acts as a neutral Expert Administrator in this process, not as arbitrator, judge, or legal representative of either party. The Determination reflects Brandior's reasonable assessment of the evidence presented.

11.4 Binding Effect. The Expert Determination is final and binding on both parties as a matter of contract. Each party expressly waives any right to contest the distribution of escrowed funds directed by the Determination, except on the ground of manifest fraud by Brandior in issuing the Determination. This waiver is given freely and with full knowledge of its consequences, and constitutes a fundamental term of this Agreement without which Brandior would not provide escrow or Expert Determination services.

11.5 Single Review. Either party may request a single review of a Determination within 7 calendar days of its issue, by submitting new material evidence that was not reasonably available at the time of the original evidence submission. A review is not an appeal on the merits. The outcome of a review is final and not subject to further challenge through the Expert Determination process.

11.6 Arbitration for Claims Against Brandior. Any dispute that is not covered by the Expert Determination process — including claims by a User against Brandior itself for breach of this Agreement, negligence, or any other cause of action — shall be referred to and finally resolved by arbitration under the Lagos Court of Arbitration Rules 2020 (or any successor rules). The seat of arbitration shall be Lagos, Nigeria. The language of the arbitration shall be English. For claims with a value below ₦10,000,000, the dispute shall be determined by a sole arbitrator appointed by agreement of the parties, or in default of agreement within 14 days, by the Lagos Court of Arbitration. For claims with a value of ₦10,000,000 or above, the dispute shall be determined by a tribunal of three arbitrators, each party appointing one and the two party-appointed arbitrators jointly appointing the third. The arbitral tribunal shall issue its final award within 90 days of its constitution. Costs shall follow the event unless the tribunal determines otherwise.

11.7 Governing Law. This Agreement and any dispute arising out of or in connection with it, including any question regarding its existence, validity, or termination, shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict-of-law principles. Nothing in this Clause limits Brandior's right to seek injunctive or other urgent interim relief in any competent Nigerian court.

## 12. NON-CIRCUMVENTION

12.1 For a period of 12 months from the date of the most recent Collab or Platform interaction between a Brand and a Creator, neither the Brand nor the Creator shall, without the prior written consent of Brandior, enter into any direct arrangement, agreement, or transaction for the provision of creative services by that Creator to that Brand, where the initial introduction between the parties was made through the Platform.

12.2 If Brandior becomes aware of a transaction that breaches Clause 12.1, the infringing party shall pay Brandior Liquidated Damages equal to 20% of the value of the off-platform transaction, such amount representing a genuine pre-estimate of the Platform Fees lost. These Liquidated Damages are in addition to any other remedy available to Brandior.

12.3 Where the value of the off-platform transaction cannot be independently verified, Brandior shall determine the Liquidated Damages amount in its reasonable discretion, having regard to the nature and scope of the Collab, the Creator's published rate card, and the Platform Fees that would have been payable on a comparable Transaction through the Platform.

## 13. DISCLAIMER OF WARRANTIES

13.1 The Platform is provided "as is" and "as available". Brandior makes no representation or warranty, express or implied, that the Platform will be uninterrupted, error-free, secure, or free of harmful components.

13.2 Brandior makes no warranty as to: (a) the quality, fitness for purpose, originality, or legality of any Deliverables; (b) the accuracy of any User-generated profile information, audience metrics, or portfolio content; (c) the financial creditworthiness or business standing of any User; or (d) the suitability of any Creator for any Brand's specific campaign objectives.

## 14. NO LIABILITY FOR TRANSACTION OUTCOMES

14.1 Because Brandior is a neutral technology intermediary and not a party to any Collab, Brandior bears no liability whatsoever for the outcome of any creative engagement facilitated through the Platform. This includes but is not limited to: (a) a Creator's failure to deliver work meeting the Brand's expectations; (b) a Brand's rejection of Deliverables; (c) underperformance of any campaign or piece of content; (d) any reputational, commercial, or financial loss suffered by either party arising from a Collab; or (e) any dispute between a Brand and a Creator not resolved through the Expert Determination process.

## 15. LIMITATION OF LIABILITY

15.1 To the maximum extent permitted by applicable law, Brandior and THE OWL COMPANY shall not be liable for: (a) any indirect, incidental, consequential, special, exemplary, or punitive loss or damage of any kind; (b) loss of revenue, profit, goodwill, data, or business opportunity; (c) loss arising from third-party payment processing failures, bank delays, card scheme decisions, or CBN regulatory actions; (d) any loss arising from an Expert Determination issued in good faith in accordance with Clause 11; or (e) any loss arising from the acts or omissions of any Brand or Creator on the Platform.

15.2 Where Brandior is found to have been directly and solely negligent in the technical operation of the Escrow Account or the Expert Determination process, Brandior's aggregate liability in respect of that specific Transaction shall not exceed the Platform Fee paid on that Transaction.

15.3 Each User acknowledges that the limitations in this Clause 15 reflect a fair and reasonable allocation of risk between the parties, having regard to the nature of the Platform as a neutral intermediary, the Platform Fee charged, and the User's exclusive control over the content and conduct of each Collab.

## 16. INDEMNIFICATION

16.1 Each User shall indemnify, defend, and hold harmless Brandior, THE OWL COMPANY, and their respective officers, directors, employees, agents, and successors from and against any and all claims, actions, proceedings, losses, damages, costs, and expenses (including reasonable legal fees) arising out of or in connection with: (a) the User's breach of any provision of this Agreement; (b) the User's infringement of any third-party Intellectual Property Right; (c) any unlawful, fraudulent, defamatory, obscene, or otherwise prohibited content uploaded, commissioned, or distributed through the Platform by the User; (d) any claim by a third party arising from a Collab to which the User was party; or (e) the User's violation of any applicable law or regulation.

## 17. FORCE MAJEURE

17.1 A "Force Majeure Event" means any event or circumstance beyond the reasonable control of a party, including without limitation: acts of God; flood, drought, earthquake, or other natural disaster; epidemic or pandemic; terrorist attack, civil war, civil commotion, or riots; war or armed conflict; nuclear, chemical, or biological contamination; fire, explosion, or accidental damage; collapse of essential infrastructure or utility services (including internet infrastructure); actions, restrictions, or orders of any government, public authority, or regulatory body (including CBN or NDPC); and any labour or trade dispute or industrial action.

17.2 Neither party shall be in breach of this Agreement or liable for any failure or delay in the performance of its obligations if that failure or delay is caused by a Force Majeure Event. The affected party shall: (a) give prompt notice of the Force Majeure Event and its expected duration; (b) use all reasonable endeavours to mitigate its effects; and (c) resume performance as soon as the Force Majeure Event has ceased.

17.3 If a Force Majeure Event continues for more than 30 consecutive days, either party may terminate any affected Collab by written notice. In such event, escrowed funds shall be distributed proportionately to the work completed up to the date of termination, as determined by Brandior acting reasonably.

## 18. TERMINATION

18.1 Termination by User. A User may close their account at any time through the Platform's account settings. Any pending Collabs or escrowed funds must be resolved before account closure can be completed.

18.2 Termination by Brandior. Brandior may suspend or permanently terminate a User's account, with or without prior notice, for: (a) any material breach of this Agreement; (b) fraudulent, abusive, or illegal conduct; (c) a pattern of conduct that threatens the integrity, safety, or reputation of the Platform or its users; or (d) any regulatory or legal obligation requiring termination or suspension. Where practicable, Brandior will give the User an opportunity to respond before termination takes effect.

18.3 Effect of Termination. On termination of a User's account: (a) the User's right to access and use the Platform ceases immediately; (b) pending Collabs will be resolved in accordance with this Agreement; (c) outstanding escrowed funds will be disbursed in accordance with Clause 7 or any Expert Determination; and (d) the following Clauses survive termination: 1 (Definitions), 9 (Intellectual Property), 10 (Confidentiality), 11 (Dispute Resolution), 12 (Non-Circumvention), 14 (No Liability for Transaction Outcomes), 15 (Limitation of Liability), 16 (Indemnification), 18.3, and 19 (General Provisions).

## 19. GENERAL PROVISIONS

19.1 Entire Agreement. This Agreement, together with the Privacy Policy, Cookie Policy, and Acceptable Use Policy, constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior representations, understandings, or agreements, whether written or oral.

19.2 Severability. If any provision of this Agreement is found by a court or arbitrator of competent jurisdiction to be invalid, unlawful, or unenforceable, that provision shall be modified to the minimum extent necessary to make it enforceable, or severed if modification is not possible, and the remaining provisions shall continue in full force and effect.

19.3 Waiver. No failure or delay by Brandior in exercising any right or remedy under this Agreement shall constitute a waiver of that right or remedy. A waiver of any breach does not constitute a waiver of any subsequent breach of the same or any other provision.

19.4 Notices. All notices from Brandior to Users will be delivered by email to the address registered on the Platform or by in-app notification. Notices from Users to Brandior must be sent to support@brandior.africa. Notices are deemed received 24 hours after sending, unless a delivery failure notification is received.

19.5 Assignment. Brandior may assign or novate its rights and obligations under this Agreement to any affiliate, successor entity, or acquirer of the Platform without User consent, provided the assignee assumes all obligations under this Agreement. Users may not assign or transfer any right or obligation under this Agreement without Brandior's prior written consent.

19.6 Changes to this Agreement. Brandior may amend this Agreement at any time. For material amendments, Brandior will give Users at least 14 days' prior notice by email. Continued use of the Platform after the effective date of any amendment constitutes acceptance of the amended Agreement. If a User does not accept the amended Agreement, they must stop using the Platform and close their account before the effective date.

19.7 Relationship with Statutory Rights. Nothing in this Agreement is intended to, nor does it, limit or exclude any right that cannot lawfully be excluded or limited under the Federal Competition and Consumer Protection Act 2018 or any other applicable Nigerian law. Where any provision of this Agreement conflicts with a mandatory statutory right, that statutory right shall prevail to the extent of the conflict.

## CONTACT

Brandior is operated by THE OWL COMPANY, Nigeria. For all legal and operational enquiries: support@brandior.africa`,

  privacy: `## PRIVACY POLICY

This Privacy Policy describes how THE OWL COMPANY ("Brandior", "we", "us") collects, uses, stores, shares, and protects your personal data when you use the Brandior Platform. It is issued in accordance with the Nigeria Data Protection Act 2023 (NDPA), the Nigeria Data Protection Regulation 2019 (NDPR), and applicable guidelines issued by the Nigeria Data Protection Commission (NDPC). This Policy was last revised in September 2026.

## 1. DATA CONTROLLER

The data controller in respect of your personal data is THE OWL COMPANY, the entity that owns and operates the Brandior Platform. Registered in Nigeria. For all privacy and data protection enquiries: support@brandior.africa.

## 2. SCOPE

This Policy applies to all personal data processed by Brandior in connection with your use of: (a) the Brandior web application (app.brandior.africa); (b) Brandior's mobile applications for Android and iOS; (c) Brandior's website (brandior.africa); and (d) any related APIs or services. It applies to all Users, regardless of account type (Brand or Creator).

## 3. PERSONAL DATA WE COLLECT

3.1 Account and Identity Data: full name; email address; account type (Brand or Creator); hashed and salted password (never stored in plain text); date of registration; and acceptance log for this Agreement (timestamp and version).

3.2 Profile Data: display name; profile photograph; bio; declared social media handles and follower counts; portfolio links and uploaded portfolio content; rate card information; selected niche categories; and bank account details provided for KYC and payout purposes.

3.3 KYC and Verification Data: government-issued photo identification; Bank Verification Number (BVN); Tax Identification Number (TIN) where required; proof of address; business registration documents where applicable; and any other documents required by the Payment Processor or by applicable CBN Know Your Customer guidelines. KYC data is processed by the Payment Processor under their own compliance framework and applicable CBN regulations.

3.4 Transaction Data: Collab order records; agreed Brief details; payment amounts and currency; Escrow Account records; payout history; wallet balances; Expert Determination outcomes; and all dispute records.

3.5 Communication Data: all messages exchanged between Users through the Platform's in-app messaging system; all correspondence with Brandior's support team; and content submitted as evidence in any Dispute.

3.6 Usage and Behavioural Data: pages and screens visited; features accessed; session duration and frequency; click and interaction patterns; search queries on the Platform; and device and browser information.

3.7 Technical Data: IP address; device identifiers (IMEI, advertising ID where applicable); browser type and version; operating system; referral URL; and connection data.

## 4. PURPOSES AND LEGAL BASES FOR PROCESSING

4.1 Contract Performance (Section 25(1)(b) NDPA): creating and maintaining your account; facilitating Collab matches between Brands and Creators; processing payments and managing the Escrow Account; conducting Expert Determinations; and sending transactional communications (account confirmation, payment notifications, delivery alerts, dispute updates).

4.2 Legal Obligation (Section 25(1)(c) NDPA): KYC verification and record-keeping under the Money Laundering (Prevention and Prohibition) Act 2022 and CBN Know Your Customer Regulations; financial record retention under the Financial Reporting Council of Nigeria Act; and compliance with lawful orders of courts and regulatory authorities including the NDPC, EFCC, and CBN.

4.3 Legitimate Interests (Section 25(1)(f) NDPA): fraud prevention and platform security; detecting and investigating breaches of our Terms; improving Platform features through anonymised and aggregated analytics; and protecting the rights and safety of our Users and the public. We have assessed these legitimate interests and determined they are not overridden by your fundamental rights.

4.4 Consent (Section 25(1)(a) NDPA): personalised communications from our team that are not strictly required for Platform operations, including founder messages and product updates. You may withdraw consent at any time by emailing support@brandior.africa. Withdrawal does not affect the lawfulness of processing before withdrawal.

## 5. INFORMATION SHARING AND DISCLOSURE

5.1 We do not sell, rent, or trade your personal data to third parties for their own commercial purposes.

5.2 We share personal data only with the following categories of recipients and only to the extent necessary: (a) Payment Processor — Rubies Finance Limited receives the personal and financial data required to operate the Escrow Account, process payouts, and conduct KYC. Rubies processes this data under their own privacy policy and is regulated by the Central Bank of Nigeria. (b) Email Delivery Provider — Resend, Inc. (resend.com) receives your email address and name to deliver transactional and relationship emails. Resend acts as a data processor under our instructions. (c) Cloud Infrastructure Provider — Supabase, Inc. (supabase.com) provides our database, authentication, and serverless computing infrastructure. Supabase processes data as our data processor under a data processing agreement. (d) Legal and Regulatory Authorities — we will disclose personal data to law enforcement agencies, courts, the NDPC, the EFCC, the CBN, or other competent authorities where required by law, court order, or to protect the rights, property, or safety of Brandior, its Users, or the public. (e) Business Transfers — if THE OWL COMPANY undergoes a merger, acquisition, restructuring, or sale of all or part of its business or assets, personal data may be transferred to the acquiring or successor entity. We will notify you by email before any such transfer takes effect and will require the receiving entity to maintain protections equivalent to those in this Policy.

## 6. INTERNATIONAL DATA TRANSFERS

6.1 Supabase and Resend may process and store your data on infrastructure located outside Nigeria, including in the United States and European Union. Where such international transfers occur, Brandior ensures they are subject to appropriate safeguards consistent with Section 43 of the NDPA 2023, including standard contractual clauses that impose data protection obligations on the receiving entity.

## 7. DATA SECURITY

7.1 Brandior implements the following technical and organisational security measures: (a) Transport Layer Security (TLS 1.2 or higher) for all data in transit; (b) AES-256 encryption for sensitive data at rest; (c) bcrypt hashing with per-user salt for all passwords; (d) role-based access controls restricting data access to authorised personnel on a need-to-know basis; (e) regular vulnerability assessments and penetration testing; and (f) incident response procedures compliant with Section 40 of the NDPA 2023.

7.2 No information system is completely secure. In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, Brandior will notify the NDPC within 72 hours of becoming aware of the breach, and will notify affected Users without undue delay where required by the NDPA.

## 8. DATA RETENTION

8.1 We retain personal data for as long as your account is active and for a reasonable period thereafter to resolve disputes, enforce our agreements, or comply with legal obligations.

8.2 Upon account closure, we will anonymise or delete your personal data within 90 days, subject to the following mandatory retention periods: (a) financial transaction records: 7 years from the date of the Transaction, as required by the Financial Reporting Council of Nigeria and anti-money laundering regulations; (b) KYC documents: for the period required by the Payment Processor's CBN obligations, which is generally 5 years from the end of the business relationship; and (c) records relevant to ongoing legal proceedings or regulatory investigations: until the matter is finally resolved.

## 9. YOUR RIGHTS UNDER THE NDPA 2023

9.1 Subject to applicable exceptions and our legal obligations, you have the following rights in respect of your personal data: (a) Right of access (Section 34): to obtain confirmation of whether we process your data and to receive a copy of it. (b) Right to rectification (Section 35): to require correction of inaccurate or incomplete data. (c) Right to erasure (Section 36): to request deletion of your data, where we no longer have a lawful basis to retain it. (d) Right to restriction (Section 37): to require us to restrict processing in certain circumstances. (e) Right to object (Section 38): to object to processing based on our legitimate interests. (f) Right to data portability (Section 39): to receive your data in a structured, commonly used, and machine-readable format. (g) Right to withdraw consent: where processing is based on consent, to withdraw it at any time without affecting the lawfulness of prior processing.

9.2 To exercise any of these rights, email support@brandior.africa. We will respond within 30 days of receipt. We may require you to verify your identity before processing your request.

## 10. AUTOMATED DECISION-MAKING

10.1 Brandior does not make decisions that produce legal or similarly significant effects on Users based solely on automated processing. Our Creator-Brand matching, badge tier assignment, and ranking systems are algorithm-assisted but subject to human oversight. They do not constitute automated decision-making within the meaning of Section 33 of the NDPA 2023.

## 11. CHILDREN'S PRIVACY

11.1 The Platform is not directed to persons under 18 years of age. Brandior does not knowingly collect personal data from minors. If we become aware that a minor has registered on the Platform, we will immediately delete their account and all associated personal data and will notify the relevant guardian where practicable.

## 12. CHANGES TO THIS POLICY

12.1 We will publish all updates to this Privacy Policy on this page with a revised date. For material changes — being changes that significantly affect your rights or how we use your data — we will notify you by email at least 14 days before the change takes effect. Continued use of the Platform after the effective date of any material change constitutes acceptance.

## 13. CONTACT AND REGULATORY COMPLAINTS

13.1 For privacy questions, data subject requests, or to report a data protection concern: support@brandior.africa.

13.2 If you believe that Brandior has processed your personal data in breach of the NDPA 2023, you have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng.`,

  cookies: `## COOKIE POLICY

This Cookie Policy explains how THE OWL COMPANY ("Brandior", "we", "us") uses cookies and similar technologies on the Brandior web application (app.brandior.africa) and website (brandior.africa). It should be read together with our Privacy Policy. This Policy was last revised in September 2026.

## 1. WHAT ARE COOKIES

Cookies are small text files placed on your device by a website. They enable the website to recognise your device, maintain your session, and remember your preferences across visits. Similar technologies include browser local storage, session storage, and IndexedDB. This Policy governs all such technologies used by Brandior.

## 2. COOKIES WE USE

2.1 Strictly Necessary Cookies. These are essential to the operation of the Platform and cannot be disabled. They: (a) maintain your authenticated login session across pages; (b) protect against Cross-Site Request Forgery (CSRF) attacks; (c) enforce session security and secure connection integrity; and (d) manage load balancing and server routing. Without these cookies, the Platform cannot function and you cannot log in.

2.2 Security Cookies. These support our fraud detection and account protection systems. They help us: (a) identify and flag unusual or suspicious login activity; (b) enforce rate limits and brute-force protections; and (c) associate your current session with your verified device profile. These cookies do not track you across third-party sites.

2.3 Preference Cookies. These remember your Platform settings between sessions, including display preferences, notification configurations, and interface choices, so you do not need to reconfigure them on each visit. Disabling them will not prevent Platform use but will result in your settings resetting on each visit.

2.4 Analytics Cookies. We collect anonymised, aggregated data about how Users navigate the Platform — which features are used, where drop-off occurs, and which flows generate errors. This data is used exclusively to improve the Platform. No personally identifiable information is included in analytics data, and we do not share analytics data with advertising networks or data brokers.

## 3. WHAT WE DO NOT USE

3.1 Brandior does not use: (a) advertising or retargeting cookies; (b) third-party tracking pixels or web beacons for behavioural profiling; (c) cross-site tracking technologies; or (d) social media tracking cookies. We do not share cookie or tracking data with any advertising network, data broker, or third-party marketing platform.

## 4. THIRD-PARTY COOKIES

4.1 Our Payment Processor and cloud infrastructure provider may set their own cookies strictly necessary for payment processing and authenticated API sessions. These cookies are governed by the respective providers' privacy and cookie policies, which we recommend you review. We do not control these cookies.

## 5. MANAGING COOKIES

5.1 You can manage, restrict, or delete cookies at any time through your browser settings. Instructions for the most common browsers are available at allaboutcookies.org. Please be aware that: (a) disabling Strictly Necessary cookies will prevent you from logging in and using authenticated features of the Platform; and (b) disabling Analytics or Preference cookies will not affect your core use of the Platform.

## 6. MOBILE APPLICATION AND LOCAL STORAGE

6.1 Brandior's Android and iOS applications do not use browser cookies. Instead, they use your device's local storage to persist your authenticated session, wallet state, and preferences. This data is stored only on your device. The processing of this data is governed by our Privacy Policy. You can clear local storage by uninstalling the application.

## 7. CHANGES TO THIS POLICY

7.1 We may update this Cookie Policy as we introduce new Platform features or as applicable technology or regulations change. Material changes will be published with a revised date. Continued use of the Platform after any update constitutes acceptance.

## CONTACT

For questions about our use of cookies: support@brandior.africa`,

  'acceptable-use': `## ACCEPTABLE USE POLICY

This Acceptable Use Policy ("AUP") sets the standards of conduct required of all Users of the Brandior Platform. It forms part of the Agreement between each User and THE OWL COMPANY and should be read together with the Terms and Conditions. This AUP was last revised in September 2026.

## 1. WHO THIS POLICY APPLIES TO

1.1 This AUP applies to every person or entity that accesses or uses the Brandior Platform, including Brands, Creators, and any third party acting on their behalf. It applies to all content created, uploaded, transmitted, commissioned, or facilitated through the Platform, regardless of account type or intended audience.

## 2. PROHIBITED CONTENT

2.1 No User may create, upload, commission, share, or facilitate the distribution of content through the Platform that: (a) is unlawful under Nigerian or applicable international law; (b) is sexually explicit, pornographic, or that sexually exploits, depicts, or endangers minors in any way — any such content will result in immediate account termination without notice and mandatory referral to the Nigeria Police Force, the National Agency for the Prohibition of Trafficking in Persons (NAPTIP), and any other relevant law enforcement authority; (c) constitutes hate speech, incitement to violence, or discrimination on the basis of race, ethnicity, religion, gender, sexual orientation, disability, or national origin, in violation of the Cybercrimes (Prohibition, Prevention, etc.) Act 2015 (as amended); (d) is defamatory, libellous, or makes false factual statements about any identifiable natural person or legal entity; (e) promotes, glorifies, funds, or facilitates terrorism, extremism, or any activity designated as illegal under the Terrorism (Prevention and Prohibition) Act 2022 or any applicable UNSC resolution; (f) advertises counterfeit goods, falsely described products, unlicensed financial services, or products prohibited under Nigerian law; (g) contains malware, spyware, ransomware, viruses, or any code designed to interrupt, damage, or gain unauthorised access to any system; (h) constitutes spam, phishing, or any unsolicited commercial communication not permitted under applicable law; or (i) violates the ARCON Code of Advertising Practice 2020 or any applicable platform community guidelines (Meta, TikTok, YouTube, X Corp, Snapchat, or any equivalent).

## 3. PROHIBITED CONDUCT

3.1 No User may: (a) impersonate any natural person, brand, business, public figure, or government authority; (b) create a false account, submit false identity documents, or misrepresent any credential, metric, or qualification; (c) circumvent the Platform's escrow system by soliciting or accepting payment off-platform for a Collab initiated through the Platform, in breach of Clause 12 of the Terms and Conditions; (d) use the Platform to launder money, evade taxes, facilitate fraud, or conduct any transaction in breach of the Money Laundering (Prevention and Prohibition) Act 2022 or the Advance Fee Fraud and Other Fraud Related Offences Act; (e) scrape, crawl, or systematically harvest User data or content from the Platform without Brandior's prior written authorisation; (f) reverse-engineer, decompile, disassemble, or otherwise attempt to extract the source code or algorithms of the Platform, in breach of the Copyright Act (Cap C28 LFN 2004); (g) conduct or attempt a denial-of-service, credential stuffing, SQL injection, cross-site scripting, or any other attack against the Platform or its infrastructure; (h) coordinate or facilitate inauthentic behaviour, including purchasing fake engagement, artificially inflating audience metrics, or manipulating Platform rankings; (i) use the Platform's messaging system to distribute unsolicited bulk communications; or (j) register multiple accounts to evade restrictions, penalties, or investigations applied to any existing account.

## 4. CREATOR CONTENT STANDARDS

4.1 Creators are personally responsible for all content they deliver through Platform Collabs. Creators must: (a) ensure Deliverables conform to the agreed Brief and are fit for the Brand's stated campaign purpose; (b) make all required sponsorship and paid partnership disclosures clearly and prominently, in accordance with ARCON guidelines and the platform policies of any platform on which Deliverables are published; (c) not incorporate third-party copyrighted material — including music, film clips, logos, trade marks, or character likenesses — in Deliverables without holding a valid licence; (d) not artificially inflate engagement metrics on published Deliverables; (e) not make unsubstantiated health, financial, safety, or comparative claims about any Brand's product or service; and (f) not publish Deliverables on channels or in contexts not agreed in the Brief without the Brand's prior written consent.

## 5. BRAND CONTENT STANDARDS

5.1 Brands are responsible for all Briefs issued and for ensuring commissioned content is lawful. Brands must: (a) submit Briefs that are lawful, accurate, and do not require Creators to make false or misleading claims; (b) not use Deliverables in any context, market, or campaign not specified in the agreed Brief without obtaining a licence extension or Full Buyout as defined in Clause 9.3 of the Terms and Conditions; (c) ensure all products and services promoted are lawful in the markets in which Deliverables will be published; (d) not require Creators to publish Deliverables in violation of the community standards or advertising policies of any platform; and (e) not include third-party intellectual property in a Brief unless you are duly licensed to instruct its use.

## 6. INTELLECTUAL PROPERTY INFRINGEMENT REPORTS

6.1 If you believe that content on the Platform infringes your Intellectual Property Rights, submit a written notice to support@brandior.africa including: (a) identification of the Intellectual Property Right claimed to be infringed (including registration number where applicable); (b) identification of the allegedly infringing material and where it appears on the Platform; (c) your full name, address, and contact details; (d) a statement that you have a good-faith belief that the use of the material is not authorised by the rights holder, their agent, or the law; and (e) a declaration that the information in the notice is accurate and that you are the rights holder or are authorised to act on their behalf.

6.2 Brandior will investigate all credible notices and may remove or restrict access to infringing content, suspend the responsible account, and refer the matter to law enforcement where appropriate.

## 7. ENFORCEMENT

7.1 Brandior reserves the right to take the following actions, singly or in combination, in response to a violation of this AUP, proportionate to the nature, severity, and history of the violation: (a) issue a formal written warning; (b) temporarily suspend the User's account and access; (c) permanently terminate the User's account and all associated data; (d) withhold escrowed funds pending investigation; (e) report the User and the relevant conduct to the Nigerian Police Force, the EFCC, the NDPC, NAPTIP, or any other relevant authority; and (f) institute civil proceedings to recover Liquidated Damages, losses, or costs as permitted under the Terms and Conditions.

7.2 The following categories of violation will result in immediate account termination and mandatory referral to law enforcement without prior warning: (a) any content involving the sexual exploitation or abuse of minors; (b) facilitation of terrorism or violent extremism; (c) large-scale financial fraud or money laundering; and (d) targeted cyber-attacks against the Platform or its Users.

## 8. REPORTING

8.1 Users who encounter conduct or content that violates this AUP are encouraged to report it by emailing support@brandior.africa with a description of the violation, the relevant username or Collab ID, and any supporting evidence. Brandior investigates all credible reports. We do not guarantee disclosure of investigation outcomes.

## 9. CHANGES

9.1 Brandior may update this AUP as the Platform evolves or as new legal requirements arise. Material changes will be communicated by email at least 14 days before they take effect. Continued use of the Platform after the effective date constitutes acceptance.

## CONTACT

For AUP enquiries or to report a violation: support@brandior.africa. Brandior is operated by THE OWL COMPANY, Nigeria.`,
}

const DEFAULTS = {
  terms:            { title: 'Terms & Conditions',    key: 'brandior_legal_terms',          path: '/terms' },
  privacy:          { title: 'Privacy Policy',         key: 'brandior_legal_privacy',        path: '/privacy' },
  cookies:          { title: 'Cookie Policy',          key: 'brandior_legal_cookies',        path: '/cookies' },
  'acceptable-use': { title: 'Acceptable Use Policy', key: 'brandior_legal_acceptable_use', path: '/acceptable-use' },
}

function renderContent(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-xl font-black mt-10 mb-3" style={{ color: '#1e0040' }}>{line.slice(3)}</h2>
    }
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-base font-bold mt-6 mb-2" style={{ color: '#3b0764' }}>{line.slice(4)}</h3>
    }
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="text-sm leading-relaxed mb-2" style={{ color: '#4b5563' }}>{line}</p>
  })
}

export default function LegalPage() {
  const location = useLocation()
  const type = location.pathname.replace('/', '')
  const config = DEFAULTS[type] || DEFAULTS.terms
  const content = (typeof localStorage !== 'undefined' && localStorage.getItem(config.key)) || DEFAULT_CONTENT[type] || ''

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{config.title} | Brandior</title>
      </Helmet>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/" className="text-sm font-medium mb-8 inline-block" style={{ color: '#7c3aed' }}>← Back to home</Link>

        {/* Doc switcher */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Object.entries(DEFAULTS).map(([key, val]) => (
            <Link
              key={key}
              to={val.path}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={type === key
                ? { backgroundColor: '#7c3aed', color: '#fff' }
                : { backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
              {val.title}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-black mb-1" style={{ color: '#1e0040' }}>{config.title}</h1>
          <p className="text-xs mb-6" style={{ color: '#9ca3af' }}>Last revised: September 2026 · Brandior is operated by THE OWL COMPANY, Nigeria</p>
          <div className="mt-6">
            {content ? renderContent(content) : (
              <p className="text-sm text-gray-400 italic">This document has not been published yet.</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">Questions? Email us at <a href="mailto:support@brandior.africa" className="text-indigo-500">support@brandior.africa</a></p>
          <p className="text-xs text-gray-300 mt-1">© 2026 Brandior · THE OWL COMPANY · Nigeria</p>
        </div>
      </div>
    </div>
  )
}
