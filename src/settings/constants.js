export const operator = 'dnb';
export const techLayers = ['N3', 'L7'];
export const basePath = '/app/project-progress-map/';
export const authLoginUrl = 'https://ndo-portal.eprojecttrackers.com/login2.php?action=projectProgressMap';
export const regions = ['CENTRAL', 'EASTERN', 'SABAH', 'SARAWAK', 'SOUTHERN', 'NORTHERN'];

export const cellNameColumn = 'Cell Name';
export const siteNameColumn = 'Site Name';
export const systemIdColumn = 'Technology';
export const clusterIdColumn = 'Cluster_ID';
export const districtIdColumn = 'DISTRICT';
export const localCouncilIdColumn = 'PBT_NAME';
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
export const expectedHeadersLocalCouncil = [
    [
        "Local council",
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
    "Overall % Co-Loc",
    "% Deployment (CME & above)",
    "% Deployment (OA & OB)"
];

export const finalHeadersLocalCouncil = [
    "Local council",
    "Region",
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

export const sheetDetails = {
    'district': {
        'sheetName': 'District',
        'expectedHeaders': expectedHeadersDistrict,
    },
    'localCouncil': {
        'sheetName': 'Local council',
        'expectedHeaders': expectedHeadersLocalCouncil,
    },
    'cluster': {
        'sheetName': 'Cluster',
        'expectedHeaders': expectedHeadersCluster,
    }
};

export const getPolygonIdKey = (selectedTypeOfKpi) => {
    return {
        'cluster': 'Cluster',
        'district': 'District',
        'localCouncil': 'Local council',
    }[selectedTypeOfKpi];
};

export const polygonDisplayNames = {
    'cluster': 'Cluster_ID',
    'district': 'DISTRICT',
    'localCouncil': 'SINGKATAN',
};
export const polygonIdKeyInGeoJSON = {
    'cluster': 'Cluster_ID',
    'district': 'DISTRICT',
    'localCouncil': 'PBT_NAME',
};