Project, Paper-writing and publication checklist
hdsfhsdfh
Abstract
* Nature’s guide to writing abstract
https://cbs.umn.edu/sites/cbs.umn.edu/files/migrated-files/downloads/Annotated_Nature_abstract.pdf

Background & Motivation
* Are the rationale and sufficient context and background for undertaking the research explained?
* Has the relevance of the research to the field been discussed?
* Is the research situated within the current literature related to the research topic?
* Include Literature review summary table, example: https://libguides.lib.msu.edu/nursinglitreview/table

Aim & Research Question
* Is the aim/objective of the research clearly communicated?
* Is the research question(s) clearly stated or indicated?
* Is the research question(s) relevant to real-world needs, challenges and applications?
* Does the research question(s) (explicitly or implicitly) align with the stated background and motivation?

If your work is data driven, work on a dataset and do EDA.
If your work is development related, design and run/simulation/extend code to generate data and may be work on that data or at least visualize

* Has the dataset been analyzed (intra and inter dataset) and have the experimental results been validated using an external dataset on which it was not trained on to prove generalizability? 
Recommended reading: https://www.sciencedirect.com/science/article/pii/S2666389920301707 

* Exploratory Data Analysis (EDA) should be done before, during and after data cleaning and transformation: https://en.wikipedia.org/wiki/Exploratory_data_analysis
For dataset analysis, in addition to testing with the test part of the same dataset, also test using a separate dataset on which the model was NOT trained on and then see if you can collect a second dataset and take the following measures.
size
distribution and clusters
statistical tools and tests
Population Stability Index (PSI)
Jensen-Shannon Divergence (JSD)
dataset visualization
https://www.data-to-viz.com/ 
https://python-graph-gallery.com/
https://r-graph-gallery.com/ 

For data visualization/understanding/processing, try:
Linear methods: https://en.wikipedia.org/wiki/Dimensionality_reduction
Non-linear methods: https://en.wikipedia.org/wiki/Nonlinear_dimensionality_reduction 

EDA and some classification/prediction examples:
General/Mixed dataset:
https://www.youtube.com/watch?v=QiqZliDXCCg&ab_channel=IBMTechnology 
https://datascienceguide.github.io/exploratory-data-analysis 
https://www.geeksforgeeks.org/steps-for-mastering-exploratory-data-analysis-eda-steps/ 
https://deepnote.com/app/anthony-mipawa-/Financial-Inclusion-in-Africa-Exploratory-data-analysisEDA-e0882926-799f-4ba0-90f5-e8730e66565b 
https://www.coursera.org/learn/ibm-exploratory-data-analysis-for-machine-learning 
Audio: https://www.kaggle.com/code/ashwanibhat/eda-audio-data
Image dataset: 
https://www.kaggle.com/code/datark1/eda-images-processing-and-exploration
https://www.kaggle.com/code/faldoae/exploratory-data-analysis-eda-for-image-datasets
Time series dataset:
https://iri.columbia.edu/~awr/wiki/Colombia/TimeSeries_SI_09.pdf 
https://www.kaggle.com/code/kanncaa1/time-series-prediction-tutorial-with-eda
https://datastud.dev/posts/time-series-eda
https://towardsdatascience.com/how-to-do-an-eda-for-time-series-cbb92b3b1913 
https://github.com/Vikasdubey0551/EDA_and_Timeseries-forecasting_power_consumption 
https://www.kaggle.com/code/nareshbhat/air-quality-analysis-eda-and-classification
https://github.com/Saanvi-Tayal/Air-Quality-Dataset-Analysis-EDA-
https://www.kaggle.com/code/asjad99/eda-tutorial-air-pollution-dataset 
https://greenplace.earth/articles/exploratory-solar-data-analysis 
https://www.geeksforgeeks.org/data-science/time-series-analysis-using-facebook-prophet/ 
https://www.artefact.com/blog/is-facebook-prophet-suited-for-doing-good-predictions-in-a-real-world-project/ 


Dataset Comparison Examples:
https://bitesizebio.com/19298/comparing-two-sets-of-data/
https://towardsdatascience.com/how-to-quickly-compare-data-sets-76a694f6868a
https://medium.com/geekculture/how-to-compare-two-datasets-c0bdc51062c7

Methodology
* Is the study linked to theory and/or guided by existing theoretical and/or analytical frameworks/algorithms?
* Are the methods used (or to be used) for designing the study and/or collecting and analyzing data thoroughly explained, where applicable?
* Are the methods used appropriate? I.e., is there an alignment between the research question(s), theory, research methods, real-world practicality?
* Do the methods address ethical considerations or concerns?
https://ethics-of-ai.mooc.fi/ 
* Do the methods consider FAIR and CARE principles?
* Are the shapes and overall process flowchart correct? Recurring steps, error handling, no dead-ends
* Have k-fold cross validation been used?
* Have multiple models been utilized (e.g. a hyperparameter sweep or an ensemble) or variations of a single model?
* May wish to try multi-modal and hybrid solutions.

Findings / Results
* Are the findings from the study described? (If the data collection / analysis is still going on, are the preliminary or tentative findings described?)
* If the findings are complete, are the impacts / implications / real-world use cases of the findings for research and/or practice highlighted with explanation?, and are the findings situated in the current literature or broader context, in related fields?
* If the findings are incomplete, are the potential implications of the findings discussed?
* Are proper visualizations used to convey the findings? Comparisons made?

Result validation and explainability
* Include various performance metrics as appropriate: F1-score, Structural Similarity Index (SSIM), Confidence interval, p-value, ROC-AUC, Mean Absolute Error (MAE), R-squared, Root Mean Square Error (RMSE), Intersection over Union ((IoU), Purple.exity, BLUE, ROUGE, SNR,  latency, throughput, error rate, resource usage, performance per component or subsystem and as a whole, etc.
* Is the system interpretable?
* Are the results explainable? If possible, incorporate multiple XAI: multiple of LIME, SHAP, DeepLIFT, Integrated Gradients (IntGrad), Input x Gradient (InputXGrad), Occlusion, Guided Backpropagation (GuidedBackprop), ELI5, YellowBrick,
Pixel Attribution:
Vanilla Gradient (Saliency Map, Sal)
DeconvNet
Grad-CAM
Guided Grad-CAM
SmoothGrad (SG)
Recommended Reading: https://www.sciencedirect.com/science/article/pii/S277266222300070X



Conclusion
* Are the conclusions drawn from the results well-supported and relevant to applications?

Future work
* Does the study provide practical implications or recommendations for practitioners to adopt or utilize techniques effectively?

References
* Are the references relevant and up-to-date?
* Do the references include mostly papers from recent years and some papers from a long range of past years, including classic significantly related papers even if they are dated so that the literature coverage is widened and is more complete?
* Have the papers and articles listed in the references been discussed and linked or cited in the literature review section?
* Have you followed a reference style?
APA7: https://apastyle.apa.org/instructional-aids/reference-examples.pdf
ACM: https://www.acm.org/publications/authors/reference-formatting



Presentation
* Is the title of the paper appropriate for the research?
* Is the abstract well-structured, clear and concise without sacrificing technical rigor, and easy to read?
* Does the introduction do a good job of story telling along with multiple visualizations about breadth and depth, significance of solving the problem?
* Is the language and editing of an appropriate academic standard?
* Are the figures, tables, and visualizations well-designed and effectively convey the key findings or insights? Does the text refer to those by number, e.g., Fig 1 describes…. There should not be any visual content which has not been referenced from the text.
* Please use a thousand separator for numbers, right align numbers in a table
* Please Mention the full form along with the abbreviation before its first mention in the report
* Add everyone’s ORCID (https://orcid.org) 
* Sequence of authors may be team leader first, then other team members, then other collaborators and supervisors including the RA and Instructors
* Are all pictures/diagrams scalable vector graphics: SVG, WMF, EPS, PDF, ADR, AI or other formats. Not screenshot or not JPG, PNG, etc. More at https://en.wikipedia.org/wiki/Vector_graphics

Plagiarism/similarity score, writing style, generative AI
* Please ensure that you have checked the plagiarism/similarity score, which must be below 4%
* Please ensure that you have not directly copied from responses from ChatGPT or other AI-based writing generators/humanizers/modifiers. The AI score should be similarly low as well.
* To reduce similarity and AI scores, it is recommended to both rephrase well and cite your sources.
* Please cross-check with https://thevisualcommunicationguy.com/wp-content/uploads/2014/09/Infographic_Did-I-Plagiarize1.jpg
https://thevisualcommunicationguy.com/2014/09/16/did-i-plagiarize-the-types-and-severity-of-plagiarism-violations/

* Please ensure that you have checked grammar and spelling using Turnitin and https://sites.google.com/site/annajiat/writing-style

* Please ensure all abbreviations have their full form mentioned before their first use.
* Please double-check the format of paper templates, including citation/reference format. For example: 
ACM: https://www.overleaf.com/latex/templates/association-for-computing-machinery-acm-sig-conference-proceedings-with-small-format-template/kxbkrwxkdgdh

* Please check if journal/conference scope matches with the paper. These two are the major reasons for paper rejections.



Recommended Reading:
http://annajiat.blogspot.com/2022/09/what-trainings-are-available-for.html

Please consult if you are planning to submit to a journal or conference. Additionally double check for venues that are not listed at 
Paper submission venues
https://docs.google.com/spreadsheets/d/16plzjeJNMZjK5S_zDLOKqqk8WOcJiWpeUrLfF6swfGU/

Take feedback from RA and the instructor at every step and before submission to any place in addition to  
Stanford Agentic Reviewer, https://paperreview.ai/ 
Rigorous project at ETH Zurich: https://www.rigorous.review/ 
SpringerNature Curie AI trial: https://beta.springernature.com/pre-submission/writing-quality?journalId=13347 

Additional checklists
https://github.com/yzhao062/cs-paper-checklist

