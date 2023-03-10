export const operator = 'dnb';
export const techLayers = ['N3', 'L7'];
export const basePath = '/app/project-progress-map/';
export const authLoginUrl = 'https://ndoportal.eprojecttrackers.com/index.php?action=projectProgressMap';
export const regions = ['CENTRAL', 'EASTERN', 'SABAH', 'SARAWAK', 'SOUTHERN'];

export const cellNameColumn = 'Cell Name';
export const siteNameColumn = 'Site Name';
export const systemIdColumn = 'Technology';
export const clusterIdColumn = 'Cluster_ID';
export const districtIdColumn = 'DISTRICT';
export const expectedHeadersDistrict = [
    [
        "District",
        "Region",
        "Overall progress",
        null,
        null
    ],
    [
        null,
        null,
        "Overall\n% Co-Loc",
        "% Deployment\n(CME & above)",
        "% Deployment\n(OA & OB)"
    ],
];
export const finalHeadersDistrict = [
    "District",
    "Region",
    "Overall progress",
    "Overall % Co-Loc",
    "% Deployment (CME & above)",
    "% Deployment (OA & OB)"
];
export const expectedHeadersCluster = [
    [
        "Cluster",
        "Region",
        "OA & OB",
        "+INT",
        "+CME End",
        "+CME Start",
        "+LOO",
        "+TP App",
        "Launch clusters"
    ],
];
export const finalHeadersCluster = [
    "Cluster",
    "Region",
    "OA & OB",
    "+INT",
    "+CME End",
    "+CME Start",
    "+LOO",
    "+TP App",
    "Launch clusters"
];