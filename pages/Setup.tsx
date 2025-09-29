import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Company, Site, Area, Point } from '../types';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Select from '../components/Select';
import QRCode from '../components/QRCode';
import { PlusCircleIcon, PrinterIcon } from '@heroicons/react/24/outline';

// A small component for the "add" forms to reduce repetition
const AddItemForm: React.FC<{
  onAdd: (name: string, customId: string, extra1?: string, extra2?: string) => Promise<void>;
  fields: { label: string; placeholder: string; type?: string }[];
  buttonText: string;
  isLoading: boolean;
}> = ({ onAdd, fields, buttonText, isLoading }) => {
  const [values, setValues] = useState<string[]>(() => fields.map(() => ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(values[0], values[1], values[2], values[3]);
    setValues(fields.map(() => '')); // Reset fields
  };

  const handleChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-dark-bg rounded-md space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, index) => (
          <Input
            key={index}
            label={field.label}
            placeholder={field.placeholder}
            type={field.type || 'text'}
            value={values[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            required={index === 0} // Only first field is usually required
          />
        ))}
      </div>
      <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
        <PlusCircleIcon className="h-5 w-5 mr-2" />
        {buttonText}
      </Button>
    </form>
  );
};

const Setup: React.FC = () => {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState({
        companies: false, sites: false, areas: false, points: false,
    });

    const [companies, setCompanies] = useState<Company[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [points, setPoints] = useState<Point[]>([]);

    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);

    // Fetch initial data
    const fetchCompanies = async () => {
        setIsLoading(prev => ({ ...prev, companies: true }));
        try {
            const data = await api.getCompanies();
            setCompanies(data);
        } catch (error: any) {
            addToast(`Error fetching companies: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, companies: false }));
        }
    };

    useEffect(() => {
        fetchCompanies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Dependent fetching
    useEffect(() => {
        if (selectedCompany) {
            setIsLoading(prev => ({ ...prev, sites: true }));
            api.getSites(selectedCompany.id).then(data => {
                setSites(data);
            }).catch((error: any) => {
                addToast(`Error fetching sites: ${error.message}`, 'error');
            }).finally(() => {
                setIsLoading(prev => ({ ...prev, sites: false }));
            });
        } else {
            setSites([]);
            setSelectedSite(null);
        }
    }, [selectedCompany, addToast]);

    useEffect(() => {
        if (selectedSite) {
            setIsLoading(prev => ({ ...prev, areas: true }));
            api.getAreas(selectedSite.id).then(data => {
                setAreas(data);
            }).catch((error: any) => {
                addToast(`Error fetching areas: ${error.message}`, 'error');
            }).finally(() => {
                setIsLoading(prev => ({ ...prev, areas: false }));
            });
        } else {
            setAreas([]);
            setSelectedArea(null);
        }
    }, [selectedSite, addToast]);

    useEffect(() => {
        if (selectedArea) {
            setIsLoading(prev => ({ ...prev, points: true }));
            api.getPoints(selectedArea.id).then(data => {
                setPoints(data);
            }).catch((error: any) => {
                addToast(`Error fetching points: ${error.message}`, 'error');
            }).finally(() => {
                setIsLoading(prev => ({ ...prev, points: false }));
            });
        } else {
            setPoints([]);
        }
    }, [selectedArea, addToast]);

    // Handlers for adding new items
    const handleAddCompany = async (name: string, customId: string) => {
        setIsLoading(prev => ({...prev, companies: true}));
        try {
            const newCompany = await api.addCompany({ name, customId });
            setCompanies(prevCompanies => [...prevCompanies, newCompany]);
            addToast('Company added successfully!', 'success');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
             setIsLoading(prev => ({...prev, companies: false}));
        }
    };
    
    const handleAddSite = async (name: string, customId: string, address?: string) => {
        if (!selectedCompany) return;
        setIsLoading(prev => ({...prev, sites: true}));
        try {
            const newSite = await api.addSite({ name, address: address || '', companyId: selectedCompany.id, customId });
            setSites(prevSites => [...prevSites, newSite]);
            addToast('Site added successfully!', 'success');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(prev => ({...prev, sites: false}));
        }
    };

    const handleAddArea = async (name: string, customId: string, description?: string) => {
        if (!selectedSite) return;
        setIsLoading(prev => ({...prev, areas: true}));
        try {
            const newArea = await api.addArea({ name, description: description || '', siteId: selectedSite.id, customId });
            setAreas(prevAreas => [...prevAreas, newArea]);
            addToast('Area added successfully!', 'success');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(prev => ({...prev, areas: false}));
        }
    };

    const handleAddPoint = async (name: string, customId: string, scanFrequencyStr?: string) => {
        if (!selectedArea) return;
        setIsLoading(prev => ({...prev, points: true}));
        const scanFrequency = scanFrequencyStr ? parseInt(scanFrequencyStr, 10) : 1;
        if (isNaN(scanFrequency) || scanFrequency < 0) {
            addToast('Scan Frequency must be a positive number.', 'error');
            setIsLoading(prev => ({...prev, points: false}));
            return;
        }
        try {
            const newPoint = await api.addPoint({ name, scanFrequency, areaId: selectedArea.id, customId });
            setPoints(prevPoints => [...prevPoints, newPoint]);
            addToast('Point added successfully!', 'success');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(prev => ({...prev, points: false}));
        }
    };
    
    // Handlers for selection changes
    const handleCompanySelect = (id: string) => {
        const company = companies.find(c => c.id === id) || null;
        setSelectedCompany(company);
        setSelectedSite(null);
        setSelectedArea(null);
    };
    const handleSiteSelect = (id: string) => {
        const site = sites.find(s => s.id === id) || null;
        setSelectedSite(site);
        setSelectedArea(null);
    };
    const handleAreaSelect = (id: string) => {
        const area = areas.find(a => a.id === id) || null;
        setSelectedArea(area);
    };
    
    const qrCodeData = (point: Point) => {
        if (!selectedCompany || !selectedSite || !selectedArea) return '';
        const data = {
            type: 'patrol-point',
            pointId: point.id,
            companyIdentifier: selectedCompany.customId || selectedCompany.id,
            siteIdentifier: selectedSite.customId || selectedSite.id,
            areaIdentifier: selectedArea.customId || selectedArea.id
        };
        return JSON.stringify(data);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
             <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        .printable-area, .printable-area * { visibility: visible; }
                        .printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                        .no-print { display: none !important; }
                        .print-qr-card { 
                            page-break-inside: avoid;
                            border: 1px solid #ccc;
                            margin-bottom: 20px;
                        }
                    }
                `}
            </style>
            <div className="flex justify-between items-center mb-6 no-print">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Setup Patrols</h1>
                {selectedArea && points.length > 0 && (
                    <Button onClick={handlePrint}>
                        <PrinterIcon className="h-5 w-5 mr-2" />
                        Print QR Codes for Area
                    </Button>
                )}
            </div>
            
            <div className="space-y-6 no-print">
                {/* Companies Section */}
                <Card title="Step 1: Company">
                    <div className="space-y-4">
                        <Select label="Select a Company" value={selectedCompany?.id || ''} onChange={(e) => handleCompanySelect(e.target.value)}>
                            <option value="">-- Select or Add a Company --</option>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                        <AddItemForm 
                            onAdd={handleAddCompany}
                            fields={[
                                {label: 'Company Name', placeholder: 'e.g., Global Security Inc.'},
                                {label: 'Custom ID (Optional)', placeholder: 'e.g., GSI-01'}
                            ]}
                            buttonText="Add Company"
                            isLoading={isLoading.companies}
                        />
                    </div>
                </Card>

                {/* Sites Section */}
                {selectedCompany && (
                    <Card title="Step 2: Site">
                        <div className="space-y-4">
                            <Select label="Select a Site" value={selectedSite?.id || ''} onChange={(e) => handleSiteSelect(e.target.value)} disabled={sites.length === 0 && !isLoading.sites}>
                                <option value="">-- Select or Add a Site --</option>
                                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </Select>
                            <AddItemForm 
                                onAdd={handleAddSite}
                                fields={[
                                    {label: 'Site Name', placeholder: 'e.g., Downtown Office Building'},
                                    {label: 'Custom ID (Optional)', placeholder: 'e.g., DT-001'},
                                    {label: 'Address', placeholder: 'e.g., 123 Main St, Anytown, USA'},
                                ]}
                                buttonText="Add Site"
                                isLoading={isLoading.sites}
                            />
                        </div>
                    </Card>
                )}

                {/* Areas Section */}
                {selectedSite && (
                     <Card title="Step 3: Area">
                        <div className="space-y-4">
                            <Select label="Select an Area" value={selectedArea?.id || ''} onChange={(e) => handleAreaSelect(e.target.value)} disabled={areas.length === 0 && !isLoading.areas}>
                                <option value="">-- Select or Add an Area --</option>
                                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </Select>
                            <AddItemForm 
                                onAdd={handleAddArea}
                                fields={[
                                    {label: 'Area Name', placeholder: 'e.g., 5th Floor - West Wing'},
                                    {label: 'Custom ID (Optional)', placeholder: 'e.g., 5W-01'},
                                    {label: 'Description', placeholder: 'e.g., Secure server room area'},
                                ]}
                                buttonText="Add Area"
                                isLoading={isLoading.areas}
                            />
                        </div>
                    </Card>
                )}

                {/* Points Section */}
                {selectedArea && (
                    <Card title="Step 4: Patrol Points">
                         <div className="space-y-4">
                            <AddItemForm 
                                onAdd={handleAddPoint}
                                fields={[
                                    {label: 'Point Name', placeholder: 'e.g., Server Rack A'},
                                    {label: 'Custom ID (Optional)', placeholder: 'e.g., SVR-A-01'},
                                    {label: 'Scan Frequency (per hour)', placeholder: '1', type: 'number'},
                                ]}
                                buttonText="Add Point"
                                isLoading={isLoading.points}
                            />
                         </div>
                    </Card>
                )}
            </div>

            {/* QR Codes Display */}
             {selectedArea && (
                <div className="printable-area mt-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        QR Codes for: {selectedArea.name}
                    </h2>
                    {isLoading.points && <p>Loading points...</p>}
                    {!isLoading.points && points.length === 0 && <p className="text-gray-500">No points added to this area yet.</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {points.map(point => (
                            <Card key={point.id} className="text-center print-qr-card">
                                <h4 className="font-bold text-lg mb-2">{point.name}</h4>
                                <div className="flex justify-center my-2">
                                   <QRCode data={qrCodeData(point)} size={160} />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Company: {selectedCompany?.name}<br/>
                                    Site: {selectedSite?.name}<br/>
                                    Area: {selectedArea.name}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Setup;