import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { NotificationType } from '../../types';
import { 
  Bell, 
  Check, 
  Sparkles, 
  Code2, 
  CreditCard, 
  Volume2, 
  Info, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    unreadNotifsCount, 
    markNotificationRead, 
    markAllNotificationsRead, 
    setShowWhatsNewModal,
    setCurrentView 
  } = useUser();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'feature' | 'billing'>('all');
  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      case 'billing':
        return <CreditCard className="w-3.5 h-3.5 text-blue-400" />;
      case 'tip':
        return <Volume2 className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={trayRef}>
      
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors relative"
        title="Notifications & Updates"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadNotifsCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadNotifsCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Tray */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-fadeIn space-y-2">
          
          {/* Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Notifications
              </h4>
              {unreadNotifsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                  {unreadNotifsCount} new
                </span>
              )}
            </div>

            {unreadNotifsCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] font-semibold text-primary-500 hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 px-1">
            {(['all', 'feature', 'billing'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                  filter === f
                    ? 'bg-slate-900 text-white dark:bg-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'feature' ? 'New Features' : f}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60 pr-1">
            {filteredNotifs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications to display.
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.actionView) {
                      setCurrentView(n.actionView);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 rounded-2xl cursor-pointer transition-all ${
                    !n.read 
                      ? 'bg-primary-50/60 dark:bg-primary-950/30 hover:bg-primary-100/60 dark:hover:bg-primary-950/50' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0"></span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {n.description}
                      </p>

                      {n.actionLabel && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-primary-500 hover:underline flex items-center gap-1">
                            <span>{n.actionLabel}</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: What's New Modal Trigger */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowWhatsNewModal(true);
              }}
              className="w-full py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>What's New in VoxCraft Studio (v1.1.0)</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
