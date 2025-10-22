/**
 * Medical Research Database Categories and Search Queries
 * 医学研究数据库类别和检索词
 */

export interface ResearchCategory {
  id: string;
  name: string;
  nameCN: string;
  description: string;
  descriptionCN: string;
  pubmedQuery: string;
  cnkiQuery: string;
  databases: string[];
  keywords: string[];
}

export const RESEARCH_CATEGORIES: ResearchCategory[] = [
  {
    id: 'gbd',
    name: 'Global Burden of Disease / Macro Health Metrics',
    nameCN: '全球疾病负担/宏观健康指标',
    description: 'DALY/YLL/YLD trends, risk attribution, country comparisons, SDG/HAQ assessment',
    descriptionCN: 'DALY/YLL/YLD时空趋势、风险归因、国家/地区比较、SDG/HAQ评估',
    pubmedQuery: '("Global Burden of Disease"[tiab] OR GBD[tiab] OR "Global Health Estimates"[tiab] OR GHE[tiab] OR "IHME"[tiab] OR GHDx[tiab]) AND (DALY[tiab] OR YLL[tiab] OR YLD[tiab] OR "comparative risk assessment"[tiab] OR "age-standardized rate"[tiab])',
    cnkiQuery: '("全球疾病负担" OR GBD OR "全球健康估计" OR GHE OR "IHME" OR GHDx) AND (DALY OR YLL OR YLD OR "比较风险评估" OR "年龄标化率")',
    databases: ['GBD', 'GHDx', 'WHO GHE'],
    keywords: ['DALY', 'YLL', 'YLD', 'disease burden', 'global health']
  },
  {
    id: 'nsqip',
    name: 'Surgical Quality Improvement / Perioperative Registry',
    nameCN: '外科质量改进/围手术期注册',
    description: 'Perioperative complications, reoperation/readmission, risk-adjusted models, surgical procedure comparisons',
    descriptionCN: '围手术期并发症、再手术/再入院、风险校正模型、术式比较',
    pubmedQuery: '("ACS NSQIP"[tiab] OR "National Surgical Quality Improvement Program"[tiab]) AND (complication*[tiab] OR readmission[tiab] OR "risk-adjusted"[tiab] OR "predictive model"[tiab])',
    cnkiQuery: '("ACS-NSQIP" OR "国家外科质量改进计划") AND (并发症 OR 再入院 OR 风险调整 OR 预测模型)',
    databases: ['ACS-NSQIP'],
    keywords: ['NSQIP', 'surgical quality', 'perioperative', 'complications']
  },
  {
    id: 'trauma',
    name: 'Trauma Database / Quality Improvement',
    nameCN: '创伤数据库/质量改进',
    description: 'Trauma outcome benchmarks, risk adjustment, process improvement, specialized reports',
    descriptionCN: '创伤结局基准、风险调整、流程改进、专题报告（儿科/颅脑/出血等）',
    pubmedQuery: '("National Trauma Data Bank"[tiab] OR NTDB[tiab] OR "Trauma Quality Improvement Program"[tiab] OR TQIP[tiab]) AND (mortality[tiab] OR complication*[tiab] OR "benchmark*"[tiab] OR "risk-adjusted"[tiab])',
    cnkiQuery: '("国家创伤数据库" OR NTDB OR "创伤质量改进" OR TQIP) AND (病死率 OR 并发症 OR 基准 OR 风险调整)',
    databases: ['NTDB', 'TQIP'],
    keywords: ['trauma', 'injury', 'NTDB', 'TQIP', 'quality improvement']
  },
  {
    id: 'transplant',
    name: 'Transplant Registry',
    nameCN: '移植注册',
    description: 'Waiting lists, organ supply/demand, transplant survival, center performance, donor-recipient matching',
    descriptionCN: '等待名单、器官供需、移植存活、中心绩效、供受体匹配',
    pubmedQuery: '(SRTR[tiab] OR OPTN[tiab] OR UNOS[tiab] OR "transplant registry"[tiab]) AND (survival[tiab] OR waitlist[tiab] OR outcome*[tiab] OR allocation[tiab])',
    cnkiQuery: '("移植登记" OR SRTR OR OPTN OR UNOS) AND (生存 OR 等候名单 OR 结局 OR 分配)',
    databases: ['SRTR', 'OPTN', 'UNOS', 'ELTR'],
    keywords: ['transplant', 'organ donation', 'SRTR', 'OPTN', 'survival']
  },
  {
    id: 'neuroimaging',
    name: 'Neuroimaging / Multicenter Longitudinal Imaging',
    nameCN: '神经影像/多中心纵向影像',
    description: 'Imaging biomarkers, progression prediction, imaging-genetics, BIDS standard reuse',
    descriptionCN: '影像生物标志物、进展预测、影像-基因、BIDS标准复用',
    pubmedQuery: '(ADNI[tiab] OR "Alzheimer\'s Disease Neuroimaging Initiative"[tiab] OR OpenNeuro[tiab] OR "BIDS"[tiab]) AND (biomarker*[tiab] OR progression[tiab] OR classification[tiab] OR segmentation[tiab])',
    cnkiQuery: '("ADNI" OR "阿尔茨海默病神经影像倡议" OR "OpenNeuro" OR "BIDS") AND (生物标志物 OR 进展 OR 分类 OR 分割)',
    databases: ['ADNI', 'OpenNeuro'],
    keywords: ['neuroimaging', 'ADNI', 'MRI', 'biomarkers', 'Alzheimer']
  },
  {
    id: 'cell-atlas',
    name: 'Single-cell & Spatial Transcriptome Atlas',
    nameCN: '单细胞与空间转录组图谱',
    description: 'Reference cell atlas, disease cell states, ligand-receptor communication, spatial distribution validation',
    descriptionCN: '参考细胞图谱、疾病细胞态、配体-受体通讯、空间分布验证',
    pubmedQuery: '("Human Cell Atlas"[tiab] OR "cell atlas"[tiab] OR cellxgene[tiab]) AND (single-cell[tiab] OR "spatial transcriptomics"[tiab] OR scRNA-seq[tiab])',
    cnkiQuery: '("人类细胞图谱" OR "细胞图谱" OR cellxgene) AND (单细胞 OR 空间转录组)',
    databases: ['Human Cell Atlas', 'cellxgene'],
    keywords: ['single-cell', 'spatial transcriptomics', 'cell atlas', 'scRNA-seq']
  },
  {
    id: 'microbiome',
    name: 'Microbiome / Metagenome',
    nameCN: '微生物组/宏基因组',
    description: 'Gut/skin/oral microbiome composition, functional pathways, phenotype associations, longitudinal interventions',
    descriptionCN: '肠道/皮肤/口腔微生物组组成、功能通路、与表型关联、纵向干预',
    pubmedQuery: '("Human Microbiome Project"[tiab] OR HMP[tiab] OR "metagenome"[tiab] OR "16S rRNA"[tiab]) AND (diversity[tiab] OR dysbiosis[tiab] OR function*[tiab] OR pathway*[tiab])',
    cnkiQuery: '("人类微生物组计划" OR HMP OR 宏基因组 OR 16S) AND (多样性 OR 失衡 OR 功能 OR 通路)',
    databases: ['HMP', 'MG-RAST', 'Qiita'],
    keywords: ['microbiome', 'metagenome', '16S rRNA', 'gut microbiota']
  },
  {
    id: 'pathogen',
    name: 'Pathogen Genome Surveillance',
    nameCN: '病原体基因组监测',
    description: 'Viral variants, lineage tracking, mutation frequency, spatiotemporal transmission',
    descriptionCN: '病毒变异谱、谱系追踪、突变频率、时空传播',
    pubmedQuery: '(GISAID[tiab] OR Nextstrain[tiab] OR "genomic surveillance"[tiab]) AND (phylogeny[tiab] OR "variant tracking"[tiab] OR "mutation frequency"[tiab])',
    cnkiQuery: '(GISAID OR Nextstrain OR "基因组监测") AND (系统发育 OR 变异监测 OR 突变频率)',
    databases: ['GISAID', 'Nextstrain', 'NCBI Virus'],
    keywords: ['pathogen', 'genomic surveillance', 'variants', 'GISAID']
  },
  {
    id: 'joint-replacement',
    name: 'Joint Replacement & Orthopedic Registry',
    nameCN: '关节置换与矫形注册',
    description: 'Implant survival, revision surgery, complications, surgeon/center differences, implant brand comparisons',
    descriptionCN: '植入物存活率、再手术、并发症、中心与术者差异、植入体品牌比较',
    pubmedQuery: '(AJRR[tiab] OR "American Joint Replacement Registry"[tiab] OR "National Joint Registry"[tiab] OR NJR[tiab]) AND (arthroplasty[tiab] OR "joint replacement"[tiab] OR hip[tiab] OR knee[tiab] OR shoulder[tiab]) AND (revision[tiab] OR survivorship[tiab] OR complication*[tiab])',
    cnkiQuery: '("美国关节置换登记" OR AJRR OR "国家关节置换登记" OR NJR) AND (关节置换 OR 髋 OR 膝 OR 肩) AND (翻修 OR 存活率 OR 并发症)',
    databases: ['AJRR', 'NJR'],
    keywords: ['arthroplasty', 'joint replacement', 'implant', 'registry']
  },
  {
    id: 'rare-disease',
    name: 'Rare Disease & Orphan Drug Knowledge Base',
    nameCN: '罕见病与孤儿药知识库',
    description: 'Rare disease nomenclature (ORPHAcode), gene-disease mapping, epidemiology, drug and clinical resources',
    descriptionCN: '罕见病命名（ORPHAcode）、基因-疾病映射、流行病学、药物与临床资源',
    pubmedQuery: '(Orphanet[tiab] OR ORPHAcode[tiab] OR "rare disease*"[tiab]) AND (epidemiology[tiab] OR natural history[tiab] OR therapy[tiab])',
    cnkiQuery: '(Orphanet OR 罕见病 OR ORPHAcode) AND (流行病学 OR 自然病程 OR 治疗)',
    databases: ['Orphanet'],
    keywords: ['rare disease', 'orphan drug', 'Orphanet', 'ORPHAcode']
  },
  {
    id: 'imaging-archive',
    name: 'Medical Imaging Open Archive',
    nameCN: '神经/全身影像开放库',
    description: 'Radiomics, imaging-genetics, segmentation/classification tasks (multimodal, multi-disease)',
    descriptionCN: '放射组学、影像-基因、分割/分类任务（多模态、多疾病）',
    pubmedQuery: '("The Cancer Imaging Archive"[tiab] OR TCIA[tiab] OR "public imaging dataset"[tiab]) AND (radiomics[tiab] OR "deep learning"[tiab] OR segmentation[tiab] OR classification[tiab])',
    cnkiQuery: '("TCIA" OR "公开影像 数据集") AND (放射组学 OR 深度学习 OR 分割 OR 分类)',
    databases: ['TCIA'],
    keywords: ['radiomics', 'TCIA', 'medical imaging', 'deep learning']
  },
  {
    id: 'gwas',
    name: 'GWAS/PheWAS/Mendelian Randomization Portal',
    nameCN: 'GWAS/PheWAS/MR数据门户',
    description: 'Variant-phenotype association search, two-sample/multivariable MR, colocalization, genetic correlation',
    descriptionCN: '变异-表型关联检索、两样本/多变量MR、共定位、遗传相关',
    pubmedQuery: '("GWAS Catalog"[tiab] OR "NHGRI-EBI"[tiab] OR OpenGWAS[tiab]) AND ("summary statistics"[tiab] OR "Mendelian randomization"[tiab] OR PheWAS[tiab] OR colocali*[tiab])',
    cnkiQuery: '("GWAS目录" OR "NHGRI-EBI" OR OpenGWAS) AND (汇总统计 OR 孟德尔随机化 OR PheWAS OR 共定位)',
    databases: ['GWAS Catalog', 'OpenGWAS', 'NHGRI-EBI'],
    keywords: ['GWAS', 'PheWAS', 'Mendelian randomization', 'genetic association']
  }
];

export const MIN_IMPACT_FACTOR = 10.0;

export const DATABASE_URLS = {
  pubmed: 'https://pubmed.ncbi.nlm.nih.gov',
  scholar: 'https://scholar.google.com',
  webofscience: 'https://www.webofscience.com'
};
