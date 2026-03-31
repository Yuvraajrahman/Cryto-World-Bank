# Project, Paper-Writing, and Publication Checklist

This file consolidates the instruction set provided for improving the thesis and preparing it to an appropriate academic standard.

## Abstract

- Use a clear structure:
  - problem/context,
  - gap,
  - proposed solution,
  - method/prototype,
  - contribution/implication.
- Keep it concise but technically meaningful.
- Reference guide:
  - Nature abstract guidance:
    `https://cbs.umn.edu/sites/cbs.umn.edu/files/migrated-files/downloads/Annotated_Nature_abstract.pdf`

## Background and Motivation

- Explain the rationale for undertaking the research.
- Provide sufficient context and background.
- Discuss why the work is relevant to the field.
- Situate the problem within current literature.
- Include a literature review summary table.
- Example summary-table guide:
  - `https://libguides.lib.msu.edu/nursinglitreview/table`

## Aim and Research Questions

- State the aim clearly.
- State research question(s) clearly.
- Ensure the research question(s) address real-world needs and applications.
- Ensure research question(s) align with the stated background and motivation.

## Data / Evidence Expectations

If the work is data-driven:

- perform Exploratory Data Analysis (EDA),
- analyze both intra-dataset and inter-dataset behavior,
- validate on an external dataset not used in training,
- examine:
  - size,
  - distribution,
  - clusters,
  - statistical tools/tests,
  - Population Stability Index (PSI),
  - Jensen-Shannon Divergence (JSD),
  - visualizations.

If the work is development-related:

- design, run, simulate, or extend code to generate data,
- at minimum visualize and evaluate generated outputs,
- do not leave the system purely descriptive.

Useful references:

- EDA:
  - `https://en.wikipedia.org/wiki/Exploratory_data_analysis`
  - `https://datascienceguide.github.io/exploratory-data-analysis`
  - `https://www.geeksforgeeks.org/steps-for-mastering-exploratory-data-analysis-eda-steps/`
- Dataset comparison:
  - `https://bitesizebio.com/19298/comparing-two-sets-of-data/`
  - `https://towardsdatascience.com/how-to-quickly-compare-data-sets-76a694f6868a`
  - `https://medium.com/geekculture/how-to-compare-two-datasets-c0bdc51062c7`
- Visualization:
  - `https://www.data-to-viz.com/`
  - `https://python-graph-gallery.com/`
  - `https://r-graph-gallery.com/`
- Dimensionality reduction:
  - `https://en.wikipedia.org/wiki/Dimensionality_reduction`
  - `https://en.wikipedia.org/wiki/Nonlinear_dimensionality_reduction`

## Methodology

- Link the study to theory, prior frameworks, algorithms, or established methods.
- Explain methods used for design, collection, and analysis thoroughly.
- Ensure alignment between:
  - research questions,
  - theory,
  - method,
  - practical implementation.
- Address ethical considerations.
- Consider FAIR and CARE principles where relevant.
- Ensure process flowcharts are correct:
  - recurring steps shown properly,
  - error handling visible,
  - no dead-ends.
- Use:
  - k-fold cross-validation where appropriate,
  - multiple models or model variants,
  - hyperparameter sweeps or comparisons,
  - potentially hybrid or multimodal approaches.

Ethics reference:

- `https://ethics-of-ai.mooc.fi/`

## Findings / Results

- Describe findings clearly, even if preliminary.
- Situate results in broader context and current literature.
- Discuss practical and research implications.
- Use appropriate visualizations and comparisons.

## Result Validation and Explainability

Use suitable performance metrics as appropriate, such as:

- F1-score
- confidence interval
- p-value
- ROC-AUC
- Mean Absolute Error (MAE)
- Root Mean Square Error (RMSE)
- R-squared
- latency
- throughput
- error rate
- resource usage
- subsystem/component performance

Use explainability methods where relevant:

- SHAP
- LIME
- DeepLIFT
- Integrated Gradients
- Input x Gradient
- Occlusion
- ELI5
- Yellowbrick
- saliency-based methods for image tasks if applicable

Recommended reading:

- `https://www.sciencedirect.com/science/article/pii/S277266222300070X`

## Conclusion

- Ensure conclusions are supported by the results.
- Keep conclusions relevant to applications and deployment implications.

## Future Work

- Provide practical recommendations for adoption or extension.
- Make future work technically credible and aligned with findings.

## References

- Keep references relevant and up to date.
- Include both:
  - recent work,
  - classic foundational work.
- Ensure cited references are actually discussed in the literature review.
- Follow a consistent citation/reference style.

Reference style guides:

- APA7:
  - `https://apastyle.apa.org/instructional-aids/reference-examples.pdf`
- ACM:
  - `https://www.acm.org/publications/authors/reference-formatting`

## Presentation Quality

- Ensure the title matches the research properly.
- Make the abstract clear and technically rigorous.
- Make the introduction tell a coherent story.
- Use figures and tables effectively.
- Every visual must be referenced from the text by number.
- Use thousand separators in numbers.
- Right-align numbers in tables where practical.
- Mention the full form before the abbreviation first appears.
- Add ORCID identifiers for authors if available.
- Follow appropriate author ordering rules.
- Prefer scalable vector graphics:
  - SVG,
  - EPS,
  - PDF,
  - AI,
  - other vector formats.
- Avoid screenshots, JPG, and PNG for final publication-quality figures when possible.

## Plagiarism, Similarity, and Generative AI Risk

- Keep plagiarism/similarity score below `4%`.
- Do not copy directly from AI tools.
- Rephrase properly and cite sources.
- Verify all references independently.
- Do not trust AI-generated facts without checking.
- Avoid AI humanizers / bypass tools.
- Check grammar and spelling carefully.
- Follow publisher, university, and venue policies on AI usage.

Useful references:

- `https://www.plagiarism.org/`
- `https://libraries.uvm.edu/c.php?g=1499226&p=11252385`
- `https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)`
- `https://thevisualcommunicationguy.com/2014/09/16/did-i-plagiarize-the-types-and-severity-of-plagiarism-violations/`

## Submission and Review Workflow

- Consult supervisor / RA / instructor at each major step.
- Check venue scope and formatting before submission.
- Use trusted review tools if desired:
  - Stanford Agentic Reviewer: `https://paperreview.ai/`
  - Rigorous Review: `https://www.rigorous.review/`
  - Springer Nature Curie AI trial:
    `https://beta.springernature.com/pre-submission/writing-quality?journalId=13347`

## Recommended Reading / Resources

- `http://annajiat.blogspot.com/2022/09/what-trainings-are-available-for.html`
- Paper venues list:
  - `https://docs.google.com/spreadsheets/d/16plzjeJNMZjK5S_zDLOKqqk8WOcJiWpeUrLfF6swfGU/`
- Extra CS paper checklist:
  - `https://github.com/yzhao062/cs-paper-checklist`

## Practical Use for This Project

For this specific thesis, the highest-value checklist items are:

1. Strong background, rationale, and problem statement.
2. Clear research questions.
3. Literature review with synthesis table.
4. Explicit novelty claim against existing DeFi systems.
5. Proper methodology for prototype and AI/ML evaluation.
6. Clear figures/tables referenced from the text.
7. Honest scope, limitations, and future work.
8. Verified and consistently formatted references.

## Items That May Still Need Human Input

- ORCID IDs for authors
- final plagiarism/similarity report
- grammar check using trusted institutional tools
- final venue-specific formatting
- final supervisor feedback integration
