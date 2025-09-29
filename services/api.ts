import { Company, Site, Area, Point, PatrolSession, PatrolStatus, ScanLog } from '../types';

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Server error');
    }
    return response.json();
};

const api = {
    // CRUD for Company
    getCompanies: (): Promise<Company[]> => fetch('/api/companies').then(res => handleResponse<Company[]>(res)),
    addCompany: (company: Omit<Company, 'id'>): Promise<Company> => {
        return fetch('/api/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(company),
        }).then(res => handleResponse<Company>(res));
    },

    // CRUD for Site
    getSites: (companyId?: string): Promise<Site[]> => {
        const url = companyId ? `/api/sites?companyId=${companyId}` : '/api/sites';
        return fetch(url).then(res => handleResponse<Site[]>(res));
    },
    addSite: (site: Omit<Site, 'id'>): Promise<Site> => {
        return fetch('/api/sites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(site),
        }).then(res => handleResponse<Site>(res));
    },

    // CRUD for Area
    getAreas: (siteId?: string): Promise<Area[]> => {
        const url = siteId ? `/api/areas?siteId=${siteId}` : '/api/areas';
        return fetch(url).then(res => handleResponse<Area[]>(res));
    },
    addArea: (area: Omit<Area, 'id'>): Promise<Area> => {
        return fetch('/api/areas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(area),
        }).then(res => handleResponse<Area>(res));
    },

    // CRUD for Point
    getPoints: (areaId?: string): Promise<Point[]> => {
        const url = areaId ? `/api/points?areaId=${areaId}` : '/api/points';
        return fetch(url).then(res => handleResponse<Point[]>(res));
    },
    addPoint: (point: Omit<Point, 'id'>): Promise<Point> => {
        return fetch('/api/points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(point),
        }).then(res => handleResponse<Point>(res));
    },
    
    // Patrols
    startPatrol: (sessionData: Omit<PatrolSession, 'id' | 'status' | 'scans' | 'startTime'>): Promise<PatrolSession> => {
        return fetch('/api/patrols/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData),
        }).then(res => handleResponse<PatrolSession>(res));
    },

    getPatrol: (id: string): Promise<PatrolSession | undefined> => {
        return fetch(`/api/patrols/${id}`).then(res => handleResponse<PatrolSession>(res));
    },

    updatePatrol: (patrol: PatrolSession): Promise<PatrolSession> => {
        return fetch(`/api/patrols/${patrol.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patrol),
        }).then(res => handleResponse<PatrolSession>(res));
    },

    getReports: (): Promise<PatrolSession[]> => {
        return fetch('/api/patrols').then(res => handleResponse<PatrolSession[]>(res));
    },

    getDashboardStats: async (): Promise<{activeSites: number, recentPatrols: PatrolSession[]}> => {
       return fetch('/api/dashboard-stats').then(res => handleResponse<{activeSites: number, recentPatrols: PatrolSession[]}>(res));
    }
};

export default api;