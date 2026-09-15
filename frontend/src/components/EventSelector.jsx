import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { Sparkles, Plus, Search, Check, ChevronDown, Calendar, Globe, MapPin, X, Image, Unlink } from 'lucide-react';

const POSTER_GALLERY = [
  {
    id: 'visionx',
    name: 'VisionX Innovation Challenge',
    matchKeywords: ['vision', 'visionx', 'innovation', 'project'],
    url: 'https://mscprpcem.blob.core.windows.net/events/VisionX.png'
  },
  {
    id: 'spark',
    name: 'Spark Flagship Event',
    matchKeywords: ['spark', 'inauguration', 'team', 'gai'],
    url: 'https://mscprpcem.blob.core.windows.net/events/clean_529287766.png'
  },
  {
    id: 'dotnet',
    name: '.NET Conf Amravati',
    matchKeywords: ['dotnet', '.net', 'c#', 'microsoft'],
    url: 'https://mscprpcem.blob.core.windows.net/events/12.png'
  },
  {
    id: 'gitlit',
    name: 'GitLit Code Fest',
    matchKeywords: ['gitlit', 'git', 'github', 'diwali', 'fest'],
    url: 'https://mscprpcem.blob.core.windows.net/events/gitlit.jpg'
  },
  {
    id: 'js_ai',
    name: 'JS AI Build-a-thon',
    matchKeywords: ['js', 'javascript', 'buildathon', 'hackathon'],
    url: 'https://mscprpcem.blob.core.windows.net/events/js_ai.png'
  },
  {
    id: 'ai_skill',
    name: 'Microsoft AI Skill Fest',
    matchKeywords: ['ai', 'copilot', 'azure', 'skill', 'cloud'],
    url: 'https://mscprpcem.blob.core.windows.net/events/aiskillfest.png'
  }
];

export default function EventSelector({
  value,
  onChange,
  onEventCreated,
  className = '',
  required = false
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef(null);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    name: '',
    category: 'Innovation Challenge',
    mode: 'Hybrid',
    venue: 'PRPCEM Campus & Virtual',
    poster_url: POSTER_GALLERY[0].url,
    description: '',
    start_date: '',
    end_date: '',
    registration_end_date: '',
    rewards: 'Certificates & Swags'
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/events');
      if (res.data?.success && Array.isArray(res.data.events)) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.warn('Failed to load events list:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background page scrolling while the create modal is open
  useEffect(() => {
    if (showCreateModal) {
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const mainEl = document.querySelector('main');
      const prevMainOverflow = mainEl ? mainEl.style.overflow : '';
      if (mainEl) mainEl.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        if (mainEl) mainEl.style.overflow = prevMainOverflow;
      };
    }
  }, [showCreateModal]);

  const handleNameChange = (nameVal) => {
    const updated = { ...newEvent, name: nameVal };
    const cleanLower = nameVal.toLowerCase();
    for (const item of POSTER_GALLERY) {
      if (item.matchKeywords.some(kw => cleanLower.includes(kw))) {
        updated.poster_url = item.url;
        break;
      }
    }
    setNewEvent(updated);
  };

  const filteredEvents = events.filter(e =>
    (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.category || '').toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    const timeA = new Date(a.start_date || a.startDate || a.date || a.createdAt || 0).getTime() || 0;
    const timeB = new Date(b.start_date || b.startDate || b.date || b.createdAt || 0).getTime() || 0;
    return timeB - timeA;
  });

  const selectedEvent = events.find(e =>
    e.id === value || (e.name && value && e.name.toLowerCase() === value.toLowerCase())
  );

  const handleSelect = (ev) => {
    onChange({
      eventId: ev.id,
      eventName: ev.name
    });
    setIsOpen(false);
    setSearch('');
  };

  const handleCreateNewEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.name.trim()) {
      setCreateError('Event name is required');
      return;
    }

    try {
      setCreating(true);
      setCreateError('');
      const res = await api.post('/api/events', newEvent);
      if (res.data?.success && res.data.event) {
        const created = res.data.event;
        setEvents(prev => [created, ...prev]);
        onChange({
          eventId: created.id,
          eventName: created.name
        });
        if (onEventCreated) onEventCreated(created);
        setShowCreateModal(false);
        setNewEvent({
          name: '',
          category: 'Innovation Challenge',
          mode: 'Hybrid',
          venue: 'PRPCEM Campus & Virtual',
          poster_url: POSTER_GALLERY[0].url,
          description: '',
          rewards: 'Certificates & Swags'
        });
        setIsOpen(false);
      }
    } catch (err) {
      setCreateError(err.response?.data?.error || err.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-left shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-xs cursor-pointer"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles size={13} />
          </div>
          <div className="truncate">
            {selectedEvent ? (
              <div>
                <span className="font-bold text-slate-800 block truncate">{selectedEvent.name}</span>
                <span className="text-[10px] text-slate-400 block">{selectedEvent.category || 'Event'} • {selectedEvent.mode || 'Offline'}</span>
              </div>
            ) : value ? (
              <span className="font-bold text-slate-800">{value}</span>
            ) : (
              <span className="text-slate-400 font-medium">Select or create an Event (e.g. VisionX Season 2)...</span>
            )}
          </div>
        </div>
        <ChevronDown size={15} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-xs animate-fade-in max-h-72 flex flex-col">
          {/* Search Box */}
          <div className="relative mb-2 shrink-0">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search existing events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              autoFocus
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-1 mb-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-purple-700 bg-purple-50/80 hover:bg-purple-100/80 rounded-xl font-bold transition-colors text-xs cursor-pointer"
            >
              <Plus size={14} className="text-purple-600" />
              <span>+ Create New Event</span>
            </button>

            {Boolean(value || selectedEvent) && (
              <button
                type="button"
                onClick={() => {
                  onChange({ eventId: null, eventName: '' });
                  setIsOpen(false);
                  setSearch('');
                }}
                className="flex items-center gap-2 px-3 py-2 text-rose-700 bg-rose-50/80 hover:bg-rose-100 rounded-xl font-bold transition-colors text-xs cursor-pointer border border-rose-200/60"
              >
                <Unlink size={14} className="text-rose-600" />
                <span>Delink Event (Standalone Quiz)</span>
              </button>
            )}
          </div>

          {/* Events List */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-1">
            {loading ? (
              <p className="text-center py-4 text-slate-400">Loading events...</p>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-4 text-slate-400">
                <p className="font-medium">No matching events found</p>
                <button
                  type="button"
                  onClick={() => {
                    handleNameChange(search);
                    setShowCreateModal(true);
                    setIsOpen(false);
                  }}
                  className="text-purple-600 font-bold text-[11px] underline mt-1 block mx-auto cursor-pointer"
                >
                  Create "{search}" as a new event
                </button>
              </div>
            ) : (
              filteredEvents.map((ev) => {
                const isSelected = selectedEvent?.id === ev.id || value === ev.name;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => handleSelect(ev)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-purple-50 text-purple-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-bold truncate">{ev.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{ev.category || 'Workshop'}</span>
                        <span>•</span>
                        <span>{ev.mode || 'Offline'}</span>
                        {ev.total_quizzes > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-purple-600 font-medium">{ev.total_quizzes} Quiz Track(s)</span>
                          </>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-purple-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Quick Create Event Modal */}
      {showCreateModal && createPortal(
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[10000] animate-fade-in"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Club Event</h3>
                  <p className="text-[11px] text-slate-500">Configure event details and sync to the main website.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {createError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateNewEvent} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VisionX Season 2, Spark '26, .NET Conf"
                  value={newEvent.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-bold"
                />
              </div>

              {/* Visual Poster Template Gallery */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Select Event Poster
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {POSTER_GALLERY.map((p) => {
                    const isSelected = newEvent.poster_url === p.url;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setNewEvent({ ...newEvent, poster_url: p.url })}
                        className={`relative rounded-xl overflow-hidden border-2 text-left transition-all p-1 group cursor-pointer ${
                          isSelected ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="h-12 rounded-lg overflow-hidden bg-slate-100 relative">
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center">
                              <Check size={10} />
                            </div>
                          )}
                        </div>
                        <span className="block text-[9px] font-bold text-slate-800 truncate mt-1">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  >
                    <option value="Innovation Challenge">Innovation Challenge</option>
                    <option value="Technical Workshop">Technical Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Buildathon">Buildathon</option>
                    <option value="Conference">Conference</option>
                    <option value="Code Fest">Code Fest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Event Mode
                  </label>
                  <select
                    value={newEvent.mode}
                    onChange={(e) => setNewEvent({ ...newEvent, mode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  >
                    <option value="Hybrid">Hybrid (Campus + Online)</option>
                    <option value="Offline">Offline (Campus)</option>
                    <option value="Online">Online (Virtual)</option>
                  </select>
                </div>
              </div>

              {/* Event Dates & Registration Deadline */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Event Starts On *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-[11px] font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Reg Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.registration_end_date}
                    onChange={(e) => setNewEvent({ ...newEvent, registration_end_date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-[11px] font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. PRPCEM Main Auditorium & Virtual"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the event agenda, topics, and activities..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  {creating ? 'Creating Event...' : 'Create & Select Event'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
