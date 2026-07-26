import { z } from "zod";
import type { AgreementTemplate } from "@/types/agreement";

export const criterionSchema = z.object({
  id: z.string(),
  label: z.string().min(3).max(60),
  humanRule: z.string().min(10).max(280),
  validatorTest: z.string().min(20).max(700),
  failureBoundary: z.string().min(10).max(400),
  weightBps: z.number().int().min(1).max(10000),
  mandatory: z.boolean(),
});

export const forgeSchema = z.object({
  title: z.string().min(3).max(120),
  brief: z.string().min(10).max(1200),
  workerMode: z.enum(["specific", "open"]),
  workerAddress: z.string().optional(),
  amountGen: z.string().refine((v) => {
    const n = parseFloat(v);
    return !isNaN(n) && n > 0;
  }, "Amount must be greater than 0"),
  acceptByIso: z.string().min(1, "Accept deadline required"),
  deliverByIso: z.string().min(1, "Delivery deadline required"),
  evidencePolicy: z.string().min(5).max(1200),
  passThresholdBps: z.number().int().min(1).max(10000),
  criteria: z
    .array(criterionSchema)
    .min(1, "At least 1 criterion required")
    .max(8, "Maximum 8 criteria"),
});

export type ForgeFormData = z.infer<typeof forgeSchema>;

export const CRITERION_TEMPLATES = [
  {
    label: "Required section present",
    humanRule: "The page must include the specified section",
    validatorTest:
      "Check the submitted URL for a visible section matching the description",
    failureBoundary: "Fail if the specified section is not found on the page",
  },
  {
    label: "Public URL accessible",
    humanRule: "The deliverable must be publicly accessible via URL",
    validatorTest:
      "Fetch the submitted URL and verify it returns a 200 status with content",
    failureBoundary:
      "Fail if the URL is unreachable, returns an error, or requires authentication",
  },
  {
    label: "Responsive layout",
    humanRule: "The page must work on mobile devices",
    validatorTest:
      "Inspect the submitted URL at mobile viewport. Confirm navigation, text, and content are usable without horizontal overflow",
    failureBoundary:
      "Fail if a core section is clipped, unreadable, or unusable at mobile width",
  },
  {
    label: "Required text included",
    humanRule: "The page must contain specific text content",
    validatorTest:
      "Search the submitted page content for the required text or close semantic equivalent",
    failureBoundary:
      "Fail if the specified text is absent from the rendered page",
  },
  {
    label: "Delivery before deadline",
    humanRule: "The work must be submitted before the agreed deadline",
    validatorTest:
      "Verify submission timestamp is before the delivery deadline",
    failureBoundary: "Fail if submitted after the deadline",
  },
  {
    label: "Repository contains file",
    humanRule: "The Git repository must contain a specified file",
    validatorTest:
      "Inspect the submitted repository URL for the required file path",
    failureBoundary:
      "Fail if the file does not exist in the repository root or specified path",
  },
  {
    label: "Link navigates correctly",
    humanRule: "A specified link must navigate to the correct destination",
    validatorTest:
      "Check the submitted page for the specified link and verify its href or navigation target",
    failureBoundary:
      "Fail if the link is missing, broken, or navigates to the wrong destination",
  },
];

export const AGREEMENT_TEMPLATES: AgreementTemplate[] = [
  {
    id: "website-delivery",
    name: "Website delivery",
    description: "A client commissions a website or web page and pays on verified delivery.",
    title: "",
    brief: "",
    evidencePolicy:
      "Submit one or more public HTTPS URLs where the deployed website can be inspected. Screenshots are not sufficient — the live page must be accessible.",
    criteria: [
      {
        label: "Page is publicly accessible",
        humanRule: "The website must be publicly accessible via the submitted URL",
        validatorTest: "Fetch the submitted URL and verify it returns a 200 status with rendered HTML content",
        failureBoundary: "Fail if the URL is unreachable, returns an error, or requires authentication",
        weightBps: 3000,
        mandatory: true,
      },
      {
        label: "Required sections present",
        humanRule: "The page must include all sections specified in the agreement brief",
        validatorTest: "Inspect the page content for each section described in the agreement and confirm it is present and visible",
        failureBoundary: "Fail if any required section described in the agreement is missing from the page",
        weightBps: 4000,
        mandatory: true,
      },
      {
        label: "Responsive on mobile",
        humanRule: "The page must be usable on mobile devices without horizontal scrolling or clipped content",
        validatorTest: "Inspect the submitted URL at a mobile viewport width and confirm navigation, text, and content are usable",
        failureBoundary: "Fail if a core section is clipped, unreadable, or unusable at mobile width",
        weightBps: 3000,
        mandatory: false,
      },
    ],
    passThresholdBps: 8000,
  },
  {
    id: "written-content",
    name: "Written content",
    description: "A client commissions written content (article, report, documentation) with specific requirements.",
    title: "",
    brief: "",
    evidencePolicy:
      "Submit a public HTTPS URL where the document can be read. PDF, Markdown, or published web page formats are acceptable.",
    criteria: [
      {
        label: "Content addresses the topic",
        humanRule: "The document must address the topic specified in the agreement",
        validatorTest: "Read the submitted document and verify its content is relevant to and addresses the topic described in the agreement",
        failureBoundary: "Fail if the document does not address the specified topic or is off-topic",
        weightBps: 4000,
        mandatory: true,
      },
      {
        label: "Minimum length met",
        humanRule: "The document must meet the minimum length requirement specified in the agreement",
        validatorTest: "Estimate the word count or length of the submitted document and compare against the requirement",
        failureBoundary: "Fail if the document is substantially shorter than the required length",
        weightBps: 2000,
        mandatory: false,
      },
      {
        label: "Sources cited",
        humanRule: "The document must cite sources where required by the agreement",
        validatorTest: "Check the document for citations, references, or links to supporting sources",
        failureBoundary: "Fail if no sources are cited when the agreement requires them",
        weightBps: 2000,
        mandatory: false,
      },
      {
        label: "Delivered before deadline",
        humanRule: "The submission must be made before the delivery deadline",
        validatorTest: "Verify the submission timestamp is before the delivery deadline",
        failureBoundary: "Fail if submitted after the deadline",
        weightBps: 2000,
        mandatory: false,
      },
    ],
    passThresholdBps: 8000,
  },
  {
    id: "design-asset",
    name: "Design asset",
    description: "A client commissions a design asset (logo, illustration, UI mockup) with specified requirements.",
    title: "",
    brief: "",
    evidencePolicy:
      "Submit public HTTPS URLs where the design asset can be viewed. Include the final asset file and any required format variants.",
    criteria: [
      {
        label: "Asset matches brief",
        humanRule: "The design asset must match the description and requirements in the agreement",
        validatorTest: "Inspect the submitted asset and verify it matches the description, style, and content requirements specified in the agreement",
        failureBoundary: "Fail if the asset does not match the brief or is missing key elements described in the agreement",
        weightBps: 5000,
        mandatory: true,
      },
      {
        label: "Required formats provided",
        humanRule: "The asset must be provided in all formats specified in the agreement",
        validatorTest: "Check the evidence for the required file formats as specified in the agreement",
        failureBoundary: "Fail if any required format is missing",
        weightBps: 2500,
        mandatory: false,
      },
      {
        label: "Delivered before deadline",
        humanRule: "The submission must be made before the delivery deadline",
        validatorTest: "Verify the submission timestamp is before the delivery deadline",
        failureBoundary: "Fail if submitted after the deadline",
        weightBps: 2500,
        mandatory: false,
      },
    ],
    passThresholdBps: 8000,
  },
  {
    id: "custom",
    name: "Custom agreement",
    description: "Define your own agreement from scratch using the Consensus Agreement Primitive. Full control over criteria, thresholds, and evidence policy.",
    title: "",
    brief: "",
    evidencePolicy:
      "Submit one or more public HTTPS URLs where the deliverable or evidence can be inspected.",
    criteria: [
      {
        label: "",
        humanRule: "",
        validatorTest: "",
        failureBoundary: "",
        weightBps: 10000,
        mandatory: true,
      },
    ],
    passThresholdBps: 8000,
  },
];
