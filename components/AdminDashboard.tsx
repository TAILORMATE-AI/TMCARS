import React, { useState, useEffect, useMemo } from 'react';
import { useCars } from '../context/CarContext.tsx';
import { Car } from '../types.ts';
import { Play, Pause, X, Plus, Edit, Trash2, CheckCircle, Clock, Save, Image as ImageIcon, CreditCard, Key, AlertCircle, TrendingUp, Settings, LogOut, ExternalLink, Calendar, Gauge, Fuel, Download, Mail, ChevronRight, Menu, Loader2, ArrowRight, Star, Tag, Smartphone, Fingerprint, Shield, Banknote, MapPin, Eye, Zap, MessageSquare, Briefcase, Camera, ChevronLeft, GripVertical, Archive, LayoutGrid, DollarSign, Edit3, UploadCloud, Link as LinkIcon, Activity, Sun, Moon, Search, ChevronDown, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { CAR_DATABASE } from '../data/carDatabase.ts';
import { DropdownScrollContainer } from './SearchRequestPage.tsx';
import { supabase } from '../lib/supabase.ts';

// Formatters
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
};

// Helper function to force download an image bypass browser display
const handleDownloadImage = async (url: string, filename: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Error downloading image:', error);
        alert('Downloading failed. You can still right click the image and save it.');
    }
};

interface AdminDashboardProps {
    onClose: () => void;
}

const FormatMixed = ({ text }: { text: string | number }) => {
    const textStr = String(text);
    return (
        <>
            {textStr.split(/(€)/g).map((part, i) =>
                part === '€' ? <span key={i} className="font-orbitron">€</span> : part
            )}
        </>
    );
};

const CATEGORY_OPTIONS = [
    'Recent', 'Sportief', 'Gezinswagens', 'SUV', 'Cabriolet', 'Stadswagens', 'Bestelwagens'
];

const FUEL_OPTIONS = ['Benzine', 'Diesel', 'Hybride', 'Elektrisch'];

// Extended Year Options
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1950 + 2 }, (_, i) => currentYear + 1 - i);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const { cars, addCar, updateCar, deleteCar, toggleArchive, toggleSold, updateCarOrder } = useCars();
    const [activeTab, setActiveTab] = useState<'welcome' | 'inventory' | 'add_edit' | 'requests'>('welcome');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Filter State
    const [filterText, setFilterText] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'sold' | 'archived'>('all');

    // Auth State

    // Auth State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Edit State
    const [editingCarId, setEditingCarId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        make: '', model: '', year: currentYear,
        price: '', priceValue: 0,
        mileage: '', mileageValue: 0,
        transmission: 'Automaat', fuel: 'Benzine',
        bodyType: 'Overig', expertTip: ''
    });

    // Media State 3.0
    const [mediaItems, setMediaItems] = useState<string[]>([]);
    const [urlInputs, setUrlInputs] = useState<string[]>(['']);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    // Dropdown States
    const [showMakeDropdown, setShowMakeDropdown] = useState(false);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    // Requests State
    const [sellRequests, setSellRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [requestToConfirm, setRequestToConfirm] = useState<{ id: string, status: string, action: 'afgehandeld' | 'delete' } | null>(null);

    useEffect(() => {
        fetchSellRequests();

        const channel = supabase
            .channel('sell-requests-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'sell_requests',
                },
                (_payload) => {
                    fetchSellRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchSellRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const { data, error } = await supabase
                .from('sell_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching requests:", error);
            } else {
                setSellRequests(data || []);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const handleAfgehandeldClick = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'nieuw' ? 'afgehandeld' : 'nieuw';
        if (newStatus === 'afgehandeld') {
            setRequestToConfirm({ id, status: currentStatus, action: 'afgehandeld' });
        } else {
            markRequestProcessed(id, currentStatus, false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setRequestToConfirm({ id, status: '', action: 'delete' });
    };

    const markRequestProcessed = async (id: string, currentStatus: string, doDeleteImages: boolean = false) => {
        const newStatus = currentStatus === 'nieuw' ? 'afgehandeld' : 'nieuw';

        if (newStatus === 'afgehandeld') {
            // User requested that "Afgehandeld" completely wipes the record and images from the database
            await deleteRequest(id);
            return;
        }

        // If for some reason reverting to 'nieuw' is ever allowed/used (currently not exposed in UI if deleted)
        let updateData: any = { status: newStatus };
        const { error } = await supabase
            .from('sell_requests')
            .update(updateData)
            .eq('id', id);

        if (!error) {
            setSellRequests(prev => prev.map(r => r.id === id ? { ...r, ...updateData } : r));
            if (selectedRequest?.id === id) {
                setSelectedRequest({ ...selectedRequest, ...updateData });
            }
        }
    };

    const deleteRequest = async (id: string) => {
        // Find the request to get image URLs
        const req = sellRequests.find(r => r.id === id);

        // Delete records from database
        const { error } = await supabase.from('sell_requests').delete().eq('id', id);
        if (!error) {
            setSellRequests(prev => prev.filter(r => r.id !== id));
            setSelectedRequest(null);

            if (req && req.images && req.images.length > 0) {
                try {
                    const pathsToDelete = req.images.map((url: string) => {
                        const parts = url.split('/');
                        return 'sell_requests/' + parts[parts.length - 1]; // reconstruct path
                    });
                    await supabase.storage.from('customer_uploads').remove(pathsToDelete);
                } catch (e) {
                    console.error("Failed to delete images from storage", e);
                }
            }
        }
    };

    // Stats
    const stockCount = cars.filter(c => !c.is_archived && !c.is_sold).length;
    const soldCount = cars.filter(c => c.is_sold).length;
    const pipelineCount = cars.filter(c => c.is_archived).length;

    const filteredCars = useMemo(() => {
        return cars
            .filter(car => {
                // Status filter
                if (filterStatus === 'live' && (car.is_sold || car.is_archived)) return false;
                if (filterStatus === 'sold' && !car.is_sold) return false;
                if (filterStatus === 'archived' && !car.is_archived) return false;
                return true;
            })
            .filter(car => {
                // Text filter
                if (filterText.trim() === '') return true;
                const searchTerm = filterText.toLowerCase();
                return (
                    car.make.toLowerCase().includes(searchTerm) ||
                    car.model.toLowerCase().includes(searchTerm) ||
                    String(car.year).includes(searchTerm)
                );
            });
    }, [cars, filterText, filterStatus]);

    useEffect(() => {
        const loggedIn = localStorage.getItem('tm_admin_logged_in');
        if (loggedIn === 'true') setIsAuthenticated(true);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'Tom123' && password === 'Tom123!') {
            setIsAuthenticated(true);
            localStorage.setItem('tm_admin_logged_in', 'true');
            setError('');
        } else {
            setError('Toegang Geweigerd: Ongeldige gegevens');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('tm_admin_logged_in');
        onClose();
    };

    const handleMakeSelect = (make: string) => {
        setFormData({ ...formData, make, model: '' });
        setAvailableModels(CAR_DATABASE[make] || []);
        setShowMakeDropdown(false);
    };

    const handleModelSelect = (model: string) => {
        setFormData({ ...formData, model });
        setShowModelDropdown(false);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (raw === '') { setFormData(p => ({ ...p, price: '', priceValue: 0 })); return; }
        const num = parseInt(raw, 10);
        setFormData(p => ({ ...p, price: new Intl.NumberFormat('nl-BE').format(num), priceValue: num }));
    };

    const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (raw === '') { setFormData(p => ({ ...p, mileage: '', mileageValue: 0 })); return; }
        const num = parseInt(raw, 10);
        setFormData(p => ({ ...p, mileage: new Intl.NumberFormat('nl-BE').format(num), mileageValue: num }));
    };

    // Media Logic
    const handleUrlInputChange = (index: number, value: string) => {
        const newInputs = [...urlInputs];
        newInputs[index] = value;
        setUrlInputs(newInputs);
    };

    const addUrlInput = () => setUrlInputs([...urlInputs, '']);

    const removeUrlInput = (index: number) => {
        const newInputs = urlInputs.filter((_, i) => i !== index);
        setUrlInputs(newInputs.length ? newInputs : ['']);
    };

    const syncUrlsToMedia = () => {
        const validUrls = urlInputs.filter(url => url.trim().length > 0);
        const newItems = [...mediaItems];
        validUrls.forEach(url => {
            if (!newItems.includes(url)) newItems.push(url);
        });
        setMediaItems(newItems);
        setUrlInputs(['']);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setMediaItems(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file as Blob);
            });
        }
    };

    const removeMediaItem = (index: number) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
    };

    const startEdit = (car: Car) => {
        setEditingCarId(car.id);
        setFormData({
            make: car.make, model: car.model, year: car.year,
            price: car.price.replace(/[€\s.]/g, ''),
            priceValue: car.priceValue,
            mileage: car.mileage.replace(/[^0-9]/g, ''),
            mileageValue: 0,
            transmission: car.transmission, fuel: car.fuel,
            bodyType: car.bodyType, expertTip: car.expertTip || ''
        });

        const priceNum = car.priceValue;
        const mileageNum = parseInt(car.mileage.replace(/[^0-9]/g, ''));
        setFormData(prev => ({
            ...prev,
            price: new Intl.NumberFormat('nl-BE').format(priceNum),
            mileage: new Intl.NumberFormat('nl-BE').format(mileageNum)
        }));

        setMediaItems(car.images || [car.image]);
        setSelectedCategories(car.categories);
        setSelectedOptions(car.options || []);
        setAvailableModels(CAR_DATABASE[car.make] || []);
        setActiveTab('add_edit');
    };

    const resetForm = () => {
        setEditingCarId(null);
        setFormData({
            make: '', model: '', year: currentYear, price: '', priceValue: 0,
            mileage: '', mileageValue: 0, transmission: 'Automaat', fuel: 'Benzine',
            bodyType: 'Overig', expertTip: ''
        });
        setMediaItems([]);
        setUrlInputs(['']);
        setSelectedCategories([]);
        setSelectedOptions([]);
    };

    const handleSubmitCar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.make || !formData.model || !formData.price || mediaItems.length === 0) {
            alert("Validatie Fout: Vul alle verplichte velden in en voeg minstens één foto toe.");
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const formattedPrice = `€ ${formData.price}`;
        const formattedMileage = `${formData.mileage} km`;

        const finalImages = [...mediaItems];
        const mainImage = finalImages[0];

        const carData = {
            make: formData.make,
            model: formData.model,
            year: Number(formData.year),
            price: formattedPrice,
            priceValue: formData.priceValue,
            mileage: formattedMileage,
            transmission: formData.transmission,
            fuel: formData.fuel,
            image: mainImage,
            images: finalImages,
            categories: selectedCategories,
            bodyType: formData.bodyType,
            options: selectedOptions,
            featured: selectedCategories.includes('Recent'),
            expertTip: formData.expertTip,
            is_archived: false,
            is_sold: false
        };

        if (editingCarId) {
            updateCar({ ...carData, id: editingCarId });
            setSuccessMsg('Wagen succesvol bijgewerkt');
        } else {
            addCar(carData);
            setSuccessMsg('Nieuwe wagen toegevoegd aan voorraad');
        }

        setIsSubmitting(false);
        setTimeout(() => {
            setSuccessMsg('');
            setActiveTab('inventory');
            resetForm();
        }, 1500);
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) return;

        // Create a new array and move the items
        const newOrderedCars = Array.from(filteredCars);
        const [reorderedItem] = newOrderedCars.splice(sourceIndex, 1);
        newOrderedCars.splice(destinationIndex, 0, reorderedItem);

        // Map back to the full car list to handle filtered views
        const updatedFullList = [...cars];

        // This is a naive reordering: it just takes the visible filtered cars and reorders them among themselves.
        // If sorting isn't happening on a fully unfiltered list, you might want an explicit "Reorder Mode".
        // But assuming we are mostly reordering in 'All' view, this is sufficient.

        updateCarOrder(newOrderedCars);
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-[60] bg-[#020202] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-[url('https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tnrautomotive.webp')] bg-cover bg-center opacity-10 blur-sm grayscale"></div>

                {/* Noise Texture */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-20">
                    <X size={24} />
                </button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/5 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-none relative z-10"
                >
                    <div className="absolute inset-[1px] border border-white/5 pointer-events-none" />
                    <div className="text-center mb-10 relative z-10">
                        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 p-3 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                            <img
                                src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tmcarslogo.webp"
                                alt="TM CARS Logo"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-[0.3em] mb-2 font-sans">Beheerpaneel</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Inloggen voor toegang</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Gebruikersnaam</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#050505] border border-white/10 p-4 text-sm text-white font-sans focus:border-white/50 focus:outline-none transition-colors placeholder-gray-700" placeholder="GEBRUIKERSNAAM" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Wachtwoord</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#050505] border border-white/10 p-4 text-sm text-white font-sans focus:border-white/50 focus:outline-none transition-colors placeholder-gray-700" placeholder="WACHTWOORD" />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-500 text-xs uppercase tracking-wider flex items-center gap-2 bg-red-900/10 p-3 border border-red-900/30">
                                    <AlertCircle size={12} /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button type="submit" className="w-full bg-white text-black font-bold uppercase tracking-[0.2em] py-4 text-xs hover:bg-gray-200 transition-colors mt-4">
                            Inloggen
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 z-[60] font-sans flex flex-col md:flex-row overflow-hidden bg-[#020202] text-white`}>

            {/* SIDEBAR — desktop: left sidebar, mobile: fixed bottom tab bar */}
            <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto w-full md:w-72 bg-[#050505] border-t md:border-t-0 md:border-r border-white/5 flex flex-col md:justify-between md:p-6 flex-shrink-0 z-50 md:z-20 relative">

                {/* Noise Texture */}
                <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                <div className="relative z-10 flex md:flex-col justify-between items-center md:items-stretch">
                    {/* Logo — desktop only */}
                    <div
                        onClick={() => setActiveTab('welcome')}
                        className="hidden md:flex mb-12 items-center gap-4 cursor-pointer group"
                    >
                        <div className="w-10 h-10 bg-black/50 rounded-lg flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                            <img
                                src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tmcarslogo.webp"
                                alt="TM CARS Logo"
                                className="w-6 h-auto object-contain transition-transform group-hover:scale-110"
                            />
                        </div>
                    </div>
                    <nav className="flex md:flex-col w-full md:items-stretch md:space-y-2 md:pb-0">
                        {/* Mobile: TM Cars logo → welcome | Desktop: hidden (logo already in sidebar header) */}
                        <button
                            onClick={() => setActiveTab('welcome')}
                            className="md:hidden flex flex-col items-center justify-center flex-1 py-2 px-1 gap-0.5 transition-all"
                        >
                            <div className="w-8 h-8 bg-black/50 rounded-lg flex items-center justify-center border border-white/10">
                                <img
                                    src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tmcarslogo.webp"
                                    alt="TM CARS"
                                    className="w-5 h-auto object-contain"
                                />
                            </div>
                        </button>
                        <button
                            onClick={() => { setActiveTab('inventory'); resetForm(); }}
                            className={`flex flex-col md:flex-row items-center justify-center flex-1 md:flex-none gap-0.5 md:gap-4 py-2 px-1 md:px-4 md:py-4 transition-all uppercase tracking-widest text-[9px] md:text-xs font-bold md:border-l-2 md:rounded-none w-full ${activeTab === 'inventory' ? 'bg-white/10 md:bg-white/5 md:border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300 md:hover:bg-white/5'}`}
                        >
                            <LayoutGrid size={20} className="md:w-4 md:h-4 shrink-0" />
                            <span className="block md:inline text-[9px] md:text-xs text-center leading-tight mt-0.5 md:mt-0">Overzicht</span>
                        </button>
                        {/* Desktop only: Toevoegen button (replaced by logo on mobile) */}
                        <button
                            onClick={() => { setActiveTab('add_edit'); resetForm(); }}
                            className={`hidden md:flex flex-row items-center justify-center flex-none gap-4 px-4 py-4 transition-all uppercase tracking-widest text-xs font-bold border-l-2 w-full ${activeTab === 'add_edit' ? 'bg-white/5 border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                        >
                            <Plus size={20} className="w-4 h-4 shrink-0" />
                            <span>Toevoegen</span>
                        </button>
                        <div className="flex flex-col flex-1 md:flex-none">
                            <button
                                onClick={() => { setActiveTab('requests'); setSelectedRequest(null); }}
                                className={`flex flex-col md:flex-row items-center justify-center md:justify-between flex-1 md:flex-none gap-0.5 md:gap-4 py-2 px-1 md:px-4 md:py-4 transition-all uppercase tracking-widest text-[9px] md:text-xs font-bold md:border-l-2 md:rounded-none relative w-full ${activeTab === 'requests' ? 'bg-white/10 md:bg-white/5 md:border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300 md:hover:bg-white/5'}`}
                            >
                                <div className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-4 w-full">
                                    <Mail size={20} className="md:w-4 md:h-4 shrink-0" />
                                    <span className="block md:inline text-[9px] md:text-xs text-center leading-tight mt-0.5 md:mt-0 w-full">Aanvragen</span>
                                </div>
                                {/* Unread badge */}
                                {sellRequests.filter(r => r.status === 'nieuw').length > 0 && (
                                    <span className="absolute md:relative -top-0.5 right-1 md:top-auto md:right-auto bg-red-500 text-white text-[8px] md:text-[9px] w-[16px] h-[16px] md:w-auto md:h-auto md:px-1.5 md:py-0.5 rounded-full md:rounded-sm shrink-0 flex items-center justify-center">
                                        {sellRequests.filter(r => r.status === 'nieuw').length} <span className="hidden xl:inline ml-1">NIEUW</span>
                                    </span>
                                )}
                            </button>

                            {/* Desktop Sub-menu List */}
                            <div className="hidden md:block">
                                <AnimatePresence>
                                    {activeTab === 'requests' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="flex flex-col overflow-y-auto custom-scrollbar max-h-[50vh] ml-4 border-l border-white/10"
                                        >
                                            {isLoadingRequests ? (
                                                <div className="p-4 flex justify-center"><Loader2 size={16} className="text-gray-500 animate-spin" /></div>
                                            ) : sellRequests.length === 0 ? (
                                                <div className="p-4 text-[10px] text-gray-500 uppercase tracking-widest">Geen aanvragen</div>
                                            ) : (
                                                sellRequests.map(req => (
                                                    <button
                                                        key={req.id}
                                                        onClick={() => setSelectedRequest(req)}
                                                        className={`text-left p-3 hover:bg-white/10 transition-colors border-l-2 ${selectedRequest?.id === req.id ? 'bg-white/5 border-white text-white' : 'border-transparent text-gray-400'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1 gap-2">
                                                            <h3 className={`font-bold text-xs font-sans truncate ${req.status === 'nieuw' ? 'text-blue-400' : ''}`}>{req.merk} {req.model}</h3>
                                                            {req.status === 'nieuw' && <span className="bg-blue-600 text-[8px] text-white px-1 py-0.5 uppercase tracking-widest font-bold shrink-0 rounded-sm">Nieuw</span>}
                                                        </div>
                                                        <div className="flex justify-between items-center group-hover:text-gray-300 transition-colors">
                                                            <p className="text-[10px] truncate max-w-[100px]">{req.naam}</p>
                                                            <p className="text-[9px] uppercase tracking-wider">{new Date(req.created_at).toLocaleDateString('nl-BE')}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        {/* Logout — mobile in bottom bar */}
                        <button onClick={handleLogout} className="md:hidden flex flex-col items-center justify-center flex-1 py-2 px-1 gap-0.5 text-red-500/80 hover:text-red-500 text-[9px] font-bold uppercase tracking-widest w-full transition-colors">
                            <LogOut size={20} className="shrink-0" />
                            <span className="block text-[9px] text-center leading-tight mt-0.5">Logout</span>
                        </button>
                    </nav>
                </div>

                <div className="hidden md:block relative z-10">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-red-500/80 hover:text-red-500 text-xs font-bold uppercase tracking-widest w-full px-4 py-2 hover:bg-red-900/10 transition-colors">
                        <LogOut size={14} /> Uitloggen
                    </button>
                </div>
            </div>

            {/* MAIN COCKPIT */}
            <div className="flex-grow flex flex-col h-full relative overflow-hidden bg-gradient-to-br from-[#0A0A0A] to-[#020202]">

                {/* TOP TELEMETRY BAR */}
                <div className="hidden md:flex flex-wrap h-auto md:h-24 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md items-center justify-between px-4 md:px-8 py-4 md:py-0 z-10 shrink-0 gap-4">
                    <div className="flex gap-6 md:gap-12 w-full md:w-auto">
                        <div className="flex flex-col flex-1 md:flex-none">
                            <span className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold mb-1">Voorraad</span>
                            <span className="text-xl md:text-2xl font-bold text-white font-sans flex items-center gap-2">
                                {stockCount} <span className="text-xs md:text-xs text-blue-500 bg-blue-500/10 px-1 rounded">LIVE</span>
                            </span>
                        </div>
                        <div className="w-[1px] h-8 md:h-10 bg-white/10 my-auto hidden sm:block"></div>
                        <div className="flex flex-col flex-1 md:flex-none">
                            <span className="text-xs text-green-500/80 uppercase tracking-[0.2em] font-bold mb-1">Verkocht</span>
                            <span className="text-xl md:text-2xl font-bold text-green-500 font-sans">{soldCount}</span>
                        </div>
                        <div className="w-[1px] h-8 md:h-10 bg-white/10 my-auto hidden sm:block"></div>
                        <div className="flex flex-col flex-1 md:flex-none">
                            <span className="text-xs text-purple-500/80 uppercase tracking-[0.2em] font-bold mb-1">Archief</span>
                            <span className="text-xl md:text-2xl font-bold text-purple-500 font-sans">{pipelineCount}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="hidden md:flex w-10 h-10 items-center justify-center bg-white/5 hover:bg-white/20 transition-colors">
                        <X size={20} className="text-white" />
                    </button>
                </div>



                <div className="flex-grow overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 relative custom-scrollbar">
                    <AnimatePresence mode="wait">

                        {/* WELCOME VIEW */}
                        {activeTab === 'welcome' && (
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="h-full flex flex-col items-center justify-center space-y-8"
                            >
                                <div className="text-center relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 p-5 sm:p-6 shadow-[0_0_50px_rgba(255,255,255,0.02)] backdrop-blur-md relative z-10">
                                        <img
                                            src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tmcarslogo.webp"
                                            alt="TM CARS Logo"
                                            className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                        />
                                    </div>

                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-10 relative z-10">Beheerpaneel & Overzicht</p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 sm:px-0 relative z-10 max-w-3xl mx-auto">
                                        <div onClick={() => setActiveTab('inventory')} className="bg-[#050505] border border-white/5 p-4 sm:p-6 hover:border-white/20 transition-all cursor-pointer group rounded-sm flex flex-col items-center justify-center">
                                            <div className="flex items-center justify-center gap-3 text-gray-400 group-hover:text-white transition-colors mb-2">
                                                <LayoutGrid size={18} className="text-blue-500/80" />
                                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Live Voorraad</span>
                                            </div>
                                            <span className="text-2xl font-bold font-sans text-white">{stockCount}</span>
                                        </div>
                                        <div onClick={() => setActiveTab('inventory')} className="bg-[#050505] border border-white/5 p-4 sm:p-6 hover:border-white/20 transition-all cursor-pointer group rounded-sm flex flex-col items-center justify-center">
                                            <div className="flex items-center justify-center gap-3 text-gray-400 group-hover:text-white transition-colors mb-2">
                                                <DollarSign size={18} className="text-green-500/80" />
                                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Verkocht</span>
                                            </div>
                                            <span className="text-2xl font-bold font-sans text-white">{soldCount}</span>
                                        </div>
                                        <div onClick={() => setActiveTab('requests')} className="bg-[#050505] border border-white/5 p-4 sm:p-6 hover:border-white/20 transition-all cursor-pointer group rounded-sm flex flex-col items-center justify-center relative">
                                            <div className="flex items-center justify-center gap-3 text-gray-400 group-hover:text-white transition-colors mb-2">
                                                <Mail size={18} className="text-red-500/80" />
                                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Aanvragen</span>
                                            </div>
                                            <span className="text-2xl font-bold font-sans text-white">{sellRequests.filter(r => r.status === 'nieuw').length}</span>
                                            {sellRequests.filter(r => r.status === 'nieuw').length > 0 && (
                                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            )}
                                        </div>
                                        <div onClick={() => setActiveTab('add_edit')} className="bg-[#050505] border border-white/5 p-4 sm:p-6 hover:border-white/20 transition-all cursor-pointer group rounded-sm flex flex-col items-center justify-center">
                                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                                                <Plus size={20} />
                                            </div>
                                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest mt-3 text-gray-500 group-hover:text-white transition-colors">Nieuwe Wagen</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* INVENTORY VIEW */}
                        {activeTab === 'inventory' && (
                            <motion.div
                                key="inventory"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="mb-6 p-4 bg-[#0A0A0A] border border-white/5 flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            placeholder="Zoek op merk, model, jaar..."
                                            value={filterText}
                                            onChange={(e) => setFilterText(e.target.value)}
                                            className="w-full bg-[#050505] border border-white/10 p-3 pl-10 text-white text-xs font-sans focus:border-white/30 focus:bg-[#111] outline-none transition-colors placeholder-gray-600"
                                        />
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 grid grid-cols-2 md:flex">
                                        <button onClick={() => setFilterStatus('all')} className={`w-full md:w-auto px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${filterStatus === 'all' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/20 hover:text-white'}`}>Alles</button>
                                        <button onClick={() => setFilterStatus('live')} className={`w-full md:w-auto px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${filterStatus === 'live' ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-gray-500 border-white/20 hover:text-blue-500'}`}>Live</button>
                                        <button onClick={() => setFilterStatus('sold')} className={`w-full md:w-auto px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${filterStatus === 'sold' ? 'bg-green-500 text-white border-green-500' : 'bg-transparent text-gray-500 border-white/20 hover:text-green-500'}`}>Verkocht</button>
                                        <button onClick={() => setFilterStatus('archived')} className={`w-full md:w-auto px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${filterStatus === 'archived' ? 'bg-purple-500 text-white border-purple-500' : 'bg-transparent text-gray-500 border-white/20 hover:text-purple-500'}`}>Archief</button>
                                    </div>
                                </div>

                                <div className="grid gap-4 mt-4">
                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="inventory-list">
                                            {(provided) => (
                                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                                    {filteredCars.map((car, index) => (
                                                        <Draggable key={car.id.toString()} draggableId={car.id.toString()} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={`relative group bg-[#0A0A0A] border hover:border-white/30 transition-all p-3 md:p-2 md:pr-6 rounded-sm flex flex-col md:flex-row items-center gap-4 md:gap-6 overflow-hidden ${car.is_sold ? 'border-green-500/30' : car.is_archived ? 'border-purple-500/30 opacity-60' : 'border-white/10'} ${snapshot.isDragging ? 'shadow-2xl border-white scale-[1.02] z-50' : ''}`}
                                                                >


                                                                    {/* Thumbnail */}
                                                                    <div className="w-full md:w-32 aspect-[3/2] md:aspect-video bg-black relative shrink-0 overflow-hidden rounded-sm md:rounded-none">
                                                                        <img src={car.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={car.model} />
                                                                        {car.is_sold && <div className="absolute inset-0 bg-green-500/20 border-2 border-green-500 flex items-center justify-center"><span className="bg-green-500 text-black text-xs font-bold px-2 py-1 uppercase tracking-widest">VERKOCHT</span></div>}
                                                                        {car.is_archived && <div className="absolute inset-0 bg-purple-900/40 flex items-center justify-center"><span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 uppercase tracking-widest">ARCHIEF</span></div>}
                                                                    </div>

                                                                    {/* Details */}
                                                                    <div className="flex-grow w-full min-w-0 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                                                        <div className="col-span-1 min-w-0">
                                                                            <span className="block text-xs text-gray-500 uppercase tracking-widest truncate">{car.make}</span>
                                                                            <span className="block text-sm font-bold text-white font-sans truncate w-full" title={car.model}>{car.model}</span>
                                                                        </div>
                                                                        <div className="col-span-1">
                                                                            <span className="block text-xs text-gray-500 uppercase tracking-widest">Prijs</span>
                                                                            <span className="text-sm font-bold text-white font-sans">
                                                                                <FormatMixed text={car.price} />
                                                                            </span>
                                                                        </div>
                                                                        <div className="col-span-2 hidden md:flex items-center gap-4 text-xs text-gray-500 font-medium">
                                                                            <span>{car.year}</span>
                                                                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                                                            <span>{car.mileage}</span>
                                                                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                                                            <span>{car.fuel}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Quick Actions */}
                                                                    <div className="flex flex-row md:flex-row w-full md:w-auto items-center justify-between md:justify-end gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                                                                        <button onClick={() => startEdit(car)} className="p-2 text-gray-400 hover:text-white transition-colors" title="Bewerken"><Edit3 size={16} /></button>
                                                                        <div className="w-[1px] h-6 bg-white/10 mx-2 hidden md:block"></div>
                                                                        <button
                                                                            onClick={() => toggleSold(car.id)}
                                                                            className={`p-2 transition-all ${car.is_sold ? 'text-green-500' : 'text-gray-600 hover:text-green-500'}`}
                                                                            title="Markeer als Verkocht"
                                                                        >
                                                                            <DollarSign size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => toggleArchive(car.id)}
                                                                            className={`p-2 transition-all ${car.is_archived ? 'text-purple-500' : 'text-gray-600 hover:text-purple-500'}`}
                                                                            title="Archiveren"
                                                                        >
                                                                            <Archive size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => { if (window.confirm('Wagen definitief verwijderen?')) deleteCar(car.id) }}
                                                                            className="p-2 text-gray-600 hover:text-red-500 transition-colors ml-auto md:ml-0"
                                                                            title="Verwijderen"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>
                            </motion.div>
                        )}

                        {/* ADD / EDIT VIEW */}
                        {activeTab === 'add_edit' && (
                            <motion.div
                                key="add_edit"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col lg:flex-row gap-8"
                            >
                                {/* LEFT: DATA ENTRY */}
                                <div className="flex-grow bg-[#0A0A0A] border border-white/5 p-4 md:p-8">
                                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                                        <h2 className="text-base md:text-lg font-bold uppercase tracking-[0.2em] text-white">
                                            {editingCarId ? 'Voertuig Bijwerken' : 'Nieuw Voertuig'}
                                        </h2>
                                        <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                            <span className="hidden sm:inline text-xs text-blue-400 uppercase tracking-widest">Bewerkingsmodus</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmitCar} className="space-y-8">
                                        {/* 1. CORE DATA */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 relative">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Merk</label>
                                                <input
                                                    type="text" required value={formData.make}
                                                    onChange={(e) => { setFormData({ ...formData, make: e.target.value, model: '' }); setShowMakeDropdown(true); setAvailableModels([]); }}
                                                    onFocus={() => setShowMakeDropdown(true)}
                                                    onBlur={() => setTimeout(() => setShowMakeDropdown(false), 200)}
                                                    className="w-full bg-[#050505] border border-white/10 p-4 text-white text-xs font-sans focus:border-white/50 focus:bg-[#111] outline-none transition-colors placeholder-gray-700"
                                                    placeholder="ZOEK MERK"
                                                />
                                                <AnimatePresence>
                                                    {showMakeDropdown && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-full left-0 right-0 bg-[#111] border border-white/10 z-50 shadow-2xl mt-1">
                                                            <DropdownScrollContainer>
                                                                {Object.keys(CAR_DATABASE).sort().filter(b => b.toLowerCase().includes(formData.make.toLowerCase())).map(brand => (
                                                                    <div key={brand} onClick={() => handleMakeSelect(brand)} className="px-4 py-3 hover:bg-white/10 cursor-pointer text-xs text-gray-300 font-sans uppercase tracking-wider">{brand}</div>
                                                                ))}
                                                            </DropdownScrollContainer>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <div className="space-y-2 relative">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Model</label>
                                                <input
                                                    type="text" required value={formData.model}
                                                    onChange={(e) => { setFormData({ ...formData, model: e.target.value }); setShowModelDropdown(true); }}
                                                    onFocus={() => setShowModelDropdown(true)}
                                                    onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
                                                    className="w-full bg-[#050505] border border-white/10 p-4 text-white text-xs font-sans focus:border-white/50 focus:bg-[#111] outline-none transition-colors disabled:opacity-50 placeholder-gray-700"
                                                    placeholder="ZOEK MODEL" disabled={!formData.make}
                                                />
                                                <AnimatePresence>
                                                    {showModelDropdown && availableModels.length > 0 && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-full left-0 right-0 bg-[#111] border border-white/10 z-50 shadow-2xl mt-1">
                                                            <DropdownScrollContainer>
                                                                {availableModels.filter(m => m.toLowerCase().includes(formData.model.toLowerCase())).map(model => (
                                                                    <div key={model} onClick={() => handleModelSelect(model)} className="px-4 py-3 hover:bg-white/10 cursor-pointer text-xs text-gray-300 font-sans uppercase tracking-wider">{model}</div>
                                                                ))}
                                                            </DropdownScrollContainer>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Prijs (€)</label>
                                                <input type="text" value={formData.price} onChange={handlePriceChange} className="w-full bg-[#050505] border border-white/10 p-4 text-white text-xs font-sans focus:border-white/50 outline-none transition-colors placeholder-gray-700" placeholder="0" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kilometerstand</label>
                                                <input type="text" value={formData.mileage} onChange={handleMileageChange} className="w-full bg-[#050505] border border-white/10 p-4 text-white text-xs font-sans focus:border-white/50 outline-none transition-colors placeholder-gray-700" placeholder="0" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bouwjaar</label>
                                                <div className="relative">
                                                    <select value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full bg-[#050505] border border-white/10 p-4 text-white text-xs font-sans outline-none appearance-none cursor-pointer focus:border-white/50 transition-colors">
                                                        {YEAR_OPTIONS.map(y => <option key={y} value={y} className="bg-[#111] text-white">{y}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Brandstof</label>
                                                <div className="relative">
                                                    <select value={formData.fuel} onChange={e => setFormData({ ...formData, fuel: e.target.value })} className="w-full bg-[#050505] border border-white/10 p-4 text-white text-xs font-sans outline-none appearance-none cursor-pointer focus:border-white/50 transition-colors">
                                                        {FUEL_OPTIONS.map(f => <option key={f} value={f} className="bg-[#111] text-white">{f}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Transmissie</label>
                                                <div className="relative">
                                                    <select value={formData.transmission} onChange={e => setFormData({ ...formData, transmission: e.target.value })} className="w-full bg-[#050505] border border-white/10 p-4 text-white text-xs font-sans outline-none appearance-none cursor-pointer focus:border-white/50 transition-colors">
                                                        <option value="Automaat" className="bg-[#111] text-white">Automaat</option>
                                                        <option value="Manueel" className="bg-[#111] text-white">Manueel</option>
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. MEDIA SUITE 3.0 */}
                                        <div className="border border-white/5 bg-[#080808] p-4 md:p-6 space-y-6">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} /> Media Beheer 3.0</h3>
                                                <span className="text-xs text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1">{mediaItems.length} Bestanden Geladen</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Source A: Direct Upload */}
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Directe Upload</label>
                                                    <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/20 hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer group">
                                                        <UploadCloud size={24} className="text-gray-500 group-hover:text-white mb-2 transition-colors" />
                                                        <span className="text-xs text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors text-center px-4">Sleep bestanden of<br />klik hier</span>
                                                        <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                                                    </label>
                                                </div>

                                                {/* Source B: Dynamic URL Array */}
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">URL Koppelingen</label>
                                                        <button type="button" onClick={addUrlInput} className="text-xs text-blue-400 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors"><Plus size={10} /> Toevoegen</button>
                                                    </div>
                                                    <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                                        {urlInputs.map((url, idx) => (
                                                            <div key={idx} className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={url}
                                                                    onChange={e => handleUrlInputChange(idx, e.target.value)}
                                                                    placeholder="https://..."
                                                                    className="flex-grow bg-[#111] border border-white/10 p-3 text-xs text-white font-sans focus:border-white/30 outline-none transition-colors"
                                                                />
                                                                {idx > 0 && (
                                                                    <button type="button" onClick={() => removeUrlInput(idx)} className="p-3 bg-red-900/20 hover:bg-red-900/40 text-red-500 transition-colors border border-red-900/30"><X size={12} /></button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button type="button" onClick={syncUrlsToMedia} className="w-full py-3 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest hover:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center gap-2 transition-colors">
                                                        <LinkIcon size={12} /> Synchroniseer URLs
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Unified Sortable Grid */}
                                            {mediaItems.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Galerij Volgorde (Sleep om te sorteren - Eerste is Hoofdfoto)</label>
                                                    <Reorder.Group axis="y" values={mediaItems} onReorder={setMediaItems} className="grid grid-cols-4 gap-3">
                                                        {mediaItems.map((item, idx) => (
                                                            <Reorder.Item
                                                                key={item}
                                                                value={item}
                                                                className="relative aspect-video group cursor-grab active:cursor-grabbing"
                                                                whileDrag={{ scale: 1.05, boxShadow: "0 0 15px rgba(229, 231, 235, 0.6)", zIndex: 50, borderColor: "rgba(255,255,255,0.8)" }}
                                                            >
                                                                <img src={item} alt="" className="w-full h-full object-cover border border-white/10" />
                                                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-colors pointer-events-none"></div>
                                                                {idx === 0 && <div className="absolute top-1 left-1 bg-blue-500 text-white text-[8px] font-bold px-1 uppercase tracking-wider">Main</div>}
                                                                <button type="button" onClick={() => removeMediaItem(idx)} className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <X size={10} />
                                                                </button>
                                                            </Reorder.Item>
                                                        ))}
                                                    </Reorder.Group>
                                                </div>
                                            )}
                                        </div>

                                        {/* 3. CATEGORIES & SUBMIT */}
                                        <div className="border-t border-white/5 pt-8">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">Classificatie Labeling</label>
                                            <div className="flex flex-wrap gap-2">
                                                {CATEGORY_OPTIONS.map(cat => (
                                                    <button type="button" key={cat} onClick={() => { if (selectedCategories.includes(cat)) setSelectedCategories(p => p.filter(c => c !== cat)); else setSelectedCategories(p => [...p, cat]); }} className={`text-xs px-4 py-2 border transition-all uppercase tracking-wide font-bold ${selectedCategories.includes(cat) ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-[#111] text-gray-500 border-white/10 hover:text-white hover:border-white/30 hover:bg-white/5'}`}>
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-14 bg-white text-black uppercase tracking-[0.2em] text-xs font-bold hover:bg-gray-200 flex justify-center items-center space-x-2 transition-colors mt-12 bg-gradient-to-r from-white to-gray-200"
                                        >
                                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} className="mr-2" /> <span>Protocol Initialiseren</span></>}
                                        </button>
                                        {successMsg && <div className="text-green-500 text-center text-xs font-bold uppercase tracking-widest mt-2">{successMsg}</div>}
                                    </form>
                                </div>

                                {/* RIGHT: LIVE PREVIEW */}
                                <div className="hidden lg:flex w-96 sticky top-0 h-screen p-8 bg-black/40 border-l border-white/5 flex-col shrink-0">
                                    <p className="text-gray-500 uppercase tracking-widest text-xs font-bold text-center mb-6">Live Voorbeeld</p>

                                    <div className="relative border border-white/10 aspect-[4/3] bg-[#030303] overflow-hidden">
                                        <div className="absolute inset-0">
                                            {mediaItems.length > 0 ? (
                                                <img src={mediaItems[0]} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-600 uppercase tracking-widest text-xs">Geen Beeld</div>
                                            )}
                                        </div>
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="bg-black/60 backdrop-blur px-2 py-1 text-white text-xs font-bold uppercase tracking-widest border border-white/10">
                                                {formData.year}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                                            <h3 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
                                                {formData.make || 'MERK'} <span className="text-gray-400 font-normal">{formData.model || 'MODEL'}</span>
                                            </h3>
                                            <p className="text-md font-bold text-white mt-1 font-sans">
                                                <FormatMixed text={`€ ${formData.price || '0'}`} />
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3 border-t border-white/5 pt-6">
                                        <div className="flex justify-between text-xs text-gray-500 border-b border-white/5 pb-2">
                                            <span>KILOMETERS</span>
                                            <span className="text-white font-sans">{formData.mileage || '0'} km</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 border-b border-white/5 pb-2">
                                            <span>BRANDSTOF</span>
                                            <span className="text-white font-sans">{formData.fuel}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 border-b border-white/5 pb-2">
                                            <span>TRANSMISSIE</span>
                                            <span className="text-white font-sans">{formData.transmission}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>ID CODE</span>
                                            <span className="text-purple-400 font-sans tracking-widest">#{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* REQUESTS VIEW */}
                        {activeTab === 'requests' && (
                            <motion.div
                                key="requests"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col md:flex-row gap-8"
                            >
                                {/* LEFT: LIST OF REQUESTS (MOBILE ONLY) */}
                                <div className={`${selectedRequest ? 'hidden' : 'flex'} md:hidden w-full flex-col bg-[#0A0A0A] border border-white/5`}>
                                    <div className="p-6 border-b border-white/5 bg-[#0A0A0A] z-10">
                                        <h2 className="text-base font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
                                            <Mail size={18} /> Verkoop Aanvragen
                                        </h2>
                                    </div>

                                    {isLoadingRequests ? (
                                        <div className="flex-grow flex items-center justify-center p-8">
                                            <Loader2 size={24} className="text-gray-500 animate-spin" />
                                        </div>
                                    ) : sellRequests.length === 0 ? (
                                        <div className="flex-grow flex items-center justify-center p-8">
                                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest text-center">Nog geen aanvragen ontvangen.</p>
                                        </div>
                                    ) : (
                                        <div className="flex-col divide-y divide-white/5">
                                            {sellRequests.map(req => (
                                                <div
                                                    key={req.id}
                                                    onClick={() => setSelectedRequest(req)}
                                                    className={`p-3 md:p-4 cursor-pointer hover:bg-white/5 transition-colors border-l-2 ${selectedRequest?.id === req.id ? 'bg-white/5 border-white' : 'border-transparent'} ${req.status === 'nieuw' ? 'border-l-blue-500 bg-blue-500/5' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-sm text-white font-sans">{req.merk} {req.model}</h3>
                                                        {req.status === 'nieuw' && <span className="bg-blue-500 text-xs text-white px-1.5 py-0.5 uppercase tracking-widest font-bold ml-2 shrink-0">Nieuw</span>}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2 group">
                                                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{req.naam}</p>
                                                        <p className="text-xs text-gray-600 uppercase tracking-wider">{new Date(req.created_at).toLocaleDateString('nl-BE')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT: REQUEST DETAIL */}
                                {selectedRequest ? (
                                    <div className="w-full flex flex-col bg-[#0A0A0A] border border-white/5 overflow-y-auto custom-scrollbar">
                                        <div className="px-2 py-3 md:p-6 border-b border-white/5 sticky top-0 bg-[#050505] z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => setSelectedRequest(null)} className="md:hidden p-2 bg-white/5 hover:bg-white/10 rounded-sm shrink-0">
                                                    <ChevronLeft size={16} className="text-white" />
                                                </button>
                                                <div className="min-w-0">
                                                    <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-wider truncate">Aanvraag Details</h2>
                                                    <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1 truncate">Ingediend op: {new Date(selectedRequest.created_at).toLocaleString('nl-BE')}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                                <button
                                                    onClick={() => handleAfgehandeldClick(selectedRequest.id, selectedRequest.status)}
                                                    className={`flex-1 md:flex-none justify-center px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${selectedRequest.status === 'afgehandeld' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-green-500 text-black hover:bg-green-400'}`}
                                                >
                                                    {selectedRequest.status === 'afgehandeld' ? <><Clock size={14} /> Markeer Nieuw</> : <><CheckCircle size={14} /> Afgehandeld</>}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(selectedRequest.id)}
                                                    className="flex-1 md:flex-none justify-center px-4 py-2 bg-red-900/20 text-red-500 hover:bg-red-900/40 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors border border-red-900/30 flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} /> Verwijder
                                                </button>
                                            </div>
                                        </div>

                                        <div className="px-2 py-4 md:p-8 space-y-8 flex-grow">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">Klantgegevens</h3>
                                                    <div className="flex flex-col gap-4">
                                                        <div>
                                                            <p className="text-xs text-gray-600 uppercase tracking-widest">Naam</p>
                                                            <p className="text-sm text-white font-sans mt-1">{selectedRequest.naam}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 uppercase tracking-widest">Telefoon</p>
                                                            <a href={`tel:${selectedRequest.tel}`} className="w-full flex items-start sm:items-center justify-between flex-wrap gap-2 p-3 mt-1 bg-gradient-to-r from-green-900/40 to-transparent border border-green-500/30 rounded-sm hover:from-green-900/60 transition-colors group">
                                                                <div className="flex items-center gap-3">
                                                                    <Smartphone size={16} className="text-green-500 shrink-0" />
                                                                    <span className="text-sm text-white font-sans font-bold tracking-wider">{selectedRequest.tel}</span>
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest bg-green-500 text-black px-2 py-1 rounded-sm shrink-0 group-hover:bg-green-400 transition-colors ml-auto sm:ml-0 mt-2 sm:mt-0">Bel Nu</span>
                                                            </a>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 uppercase tracking-widest">Email</p>
                                                            <a href={`mailto:${selectedRequest.email}`} className="w-full flex items-start sm:items-center justify-between flex-wrap gap-2 p-3 mt-1 bg-gradient-to-r from-blue-900/40 to-transparent border border-blue-500/30 rounded-sm hover:from-blue-900/60 transition-colors group">
                                                                <div className="flex items-center gap-3 break-all flex-1 min-w-0 pr-4">
                                                                    <Mail size={16} className="text-blue-500 shrink-0" />
                                                                    <span className="text-sm text-white font-sans font-bold tracking-wider break-words w-full">{selectedRequest.email}</span>
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500 text-black px-2 py-1 rounded-sm shrink-0 group-hover:bg-blue-400 transition-colors self-end mt-2 sm:mt-0">Mail Nu</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">Voertuiggegevens</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs text-gray-600 uppercase tracking-widest">Merk & Model</p>
                                                            <p className="text-sm text-white font-sans mt-1">{selectedRequest.merk} {selectedRequest.model}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 uppercase tracking-widest">Bouwjaar / KM-stand</p>
                                                            <p className="text-sm text-white font-sans mt-1">
                                                                {selectedRequest.bouwjaar || '?'} / <FormatMixed text={`€${selectedRequest.kilometerstand || '?'}`} /> km
                                                            </p>
                                                        </div>
                                                        <div className="col-span-1 md:col-span-2">
                                                            <p className="text-xs text-gray-600 uppercase tracking-widest">Chassisnummer (VIN)</p>
                                                            <p className="text-sm text-white font-sans mt-1 break-all bg-white/5 px-2 py-1 inline-block rounded-sm border border-white/5">{selectedRequest.vin || 'Niet opgegeven'}</p>
                                                        </div>
                                                        <div className="col-span-1 md:col-span-2">
                                                            <p className="text-xs text-gray-600 uppercase tracking-widest">Extra Bericht & Schade</p>
                                                            <div className="mt-1 space-y-2">
                                                                {selectedRequest.extra_message && (
                                                                    <p className="text-sm text-white font-sans break-words whitespace-pre-wrap"><span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Bericht:</span>{selectedRequest.extra_message}</p>
                                                                )}
                                                                <p className="text-sm text-gray-300 font-sans italic break-words whitespace-pre-wrap"><span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Schade:</span>{selectedRequest.damage_notes || 'Geen schade opmerkingen'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-white/5">
                                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Geüploade Foto's ({selectedRequest.images?.length || 0})</h3>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {selectedRequest.images && selectedRequest.images.length > 0 ? (
                                                        selectedRequest.images.map((img: string, i: number) => (
                                                            <div key={i} className="group relative border border-white/10 bg-[#050505] p-2 aspect-[4/3]">
                                                                <img src={img} className="w-full h-full object-cover" alt={`Upload ${i}`} />
                                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleDownloadImage(img, `VerkoopAanvraag_${selectedRequest.merk}_${selectedRequest.model}_Foto${i + 1}.jpg`)}
                                                                        className="bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 transition-colors"
                                                                    >
                                                                        <Download size={14} /> Download
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-600 text-xs italic font-sans col-span-full">Geen foto's toegevoegd bij deze aanvraag.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="hidden md:flex flex-grow flex-col items-center justify-center border border-white/5 bg-[#050505]/50 overflow-y-auto">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <Mail size={24} className="text-gray-500" />
                                        </div>
                                        <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Selecteer een aanvraag om de details te bekijken</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {/* CONFIRMATION MODAL */}
                    <AnimatePresence>
                        {requestToConfirm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="bg-[#050505] border border-white/10 max-w-[480px] w-full p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden"
                                >
                                    {/* Subtiele glow achtergrond in de modal */}
                                    <div className={`absolute top-0 left-0 w-full h-1 ${requestToConfirm.action === 'delete' ? 'bg-gradient-to-r from-red-600 to-red-900' : 'bg-gradient-to-r from-orange-500 to-red-600'}`} />
                                    <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] pointer-events-none ${requestToConfirm.action === 'delete' ? 'bg-red-600/10' : 'bg-orange-500/10'}`} />

                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-4 ${requestToConfirm.action === 'delete' ? 'bg-red-900/30 border-red-500/30 text-red-500' : 'bg-orange-900/30 border-orange-500/30 text-orange-500'}`}>
                                            {requestToConfirm.action === 'delete' ? <Trash2 size={36} /> : <CheckCircle size={36} />}
                                        </div>

                                        <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-widest mb-3 leading-none">
                                            {requestToConfirm.action === 'delete' ? 'VERWIJDEREN?' : 'AFHANDELEN?'}
                                        </h3>
                                        <p className="text-gray-400 text-sm font-sans mb-8 px-4">
                                            {requestToConfirm.action === 'delete'
                                                ? 'Dit verwijdert de aanvraag permanent. Dit kan niet ongedaan worden gemaakt.'
                                                : 'Hiermee markeer je deze aanvraag als afgehandeld.'
                                            }
                                        </p>

                                        <div className={`w-full border-l-4 p-5 mb-8 text-left bg-white/5 ${requestToConfirm.action === 'delete' ? 'border-red-500' : 'border-orange-500'}`}>
                                            <p className={`text-sm md:text-base uppercase tracking-widest font-bold mb-2 flex items-center gap-2 ${requestToConfirm.action === 'delete' ? 'text-red-400' : 'text-orange-400'}`}>
                                                <AlertCircle size={18} /> LET OP: FOTO'S GEWIST
                                            </p>
                                            <p className="text-xs md:text-sm text-gray-300 font-sans leading-relaxed">
                                                Om serverruimte te besparen worden de geüploade foto's <strong>direct en permanent</strong> verwijderd.
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row w-full gap-3">
                                            <button
                                                onClick={() => setRequestToConfirm(null)}
                                                className="flex-1 px-4 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                                            >
                                                Annuleren
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (requestToConfirm.action === 'delete') {
                                                        deleteRequest(requestToConfirm.id);
                                                    } else {
                                                        markRequestProcessed(requestToConfirm.id, requestToConfirm.status, true);
                                                    }
                                                    setRequestToConfirm(null);
                                                }}
                                                className={`flex-1 px-4 py-4 text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border ${requestToConfirm.action === 'delete'
                                                    ? 'bg-red-600 text-white hover:bg-red-500 border-red-500'
                                                    : 'bg-green-500 text-black hover:bg-green-400 border-green-500'
                                                    }`}
                                            >
                                                {requestToConfirm.action === 'delete' ? <Trash2 size={18} /> : <CheckCircle size={18} />}
                                                {requestToConfirm.action === 'delete' ? 'JA, VERWIJDER' : 'JA, WIS & AFHANDELEN'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;