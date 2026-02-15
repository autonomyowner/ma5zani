'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface CustomDomainSectionProps {
  storefrontId: Id<'storefronts'>;
  storefrontSlug: string;
}

export default function CustomDomainSection({ storefrontId, storefrontSlug }: CustomDomainSectionProps) {
  const { language, t } = useLanguage();
  const cd = t.customDomain;

  const domain = useQuery(api.customDomains.getMyCustomDomain);
  const addDomain = useMutation(api.customDomains.addCustomDomain);
  const updateStatus = useMutation(api.customDomains.updateDomainStatus);
  const removeDomain = useMutation(api.customDomains.removeCustomDomain);

  const [hostname, setHostname] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-poll status when pending
  useEffect(() => {
    if (!domain || domain.status !== 'pending_validation' || !domain.cloudflareHostnameId) return;

    const interval = setInterval(() => {
      checkCfStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [domain?.status, domain?.cloudflareHostnameId]);

  const handleConnect = async () => {
    const clean = hostname.toLowerCase().trim();
    if (!clean) return;

    setConnecting(true);
    setError('');
    try {
      // 1. Create record in Convex
      const domainId = await addDomain({ hostname: clean, storefrontId });

      // 2. Provision on Cloudflare
      const res = await fetch('/api/custom-domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname: clean }),
      });
      const data = await res.json();

      if (res.ok && data.cloudflareHostnameId) {
        // 3. Update Convex with CF hostname ID
        await updateStatus({
          domainId,
          status: 'pending_validation',
          cloudflareHostnameId: data.cloudflareHostnameId,
          sslStatus: data.sslStatus || 'pending',
        });
      }
      // Even if CF fails, the domain record exists in pending state

      setHostname('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('DOMAIN_TAKEN')) setError(cd.domainTaken);
      else if (msg.includes('ALREADY_HAS_DOMAIN')) setError(cd.alreadyHasDomain);
      else if (msg.includes('INVALID_DOMAIN')) setError(cd.invalidDomain);
      else setError(msg || 'Error');
    } finally {
      setConnecting(false);
    }
  };

  const checkCfStatus = useCallback(async () => {
    if (!domain || !domain.cloudflareHostnameId) return;

    setChecking(true);
    try {
      const res = await fetch(`/api/custom-domains?cloudflareHostnameId=${domain.cloudflareHostnameId}`);
      const data = await res.json();

      if (res.ok && data.status) {
        await updateStatus({
          domainId: domain._id,
          status: data.status,
          sslStatus: data.sslStatus,
        });
      }
    } catch {
      // Ignore
    } finally {
      setChecking(false);
    }
  }, [domain?._id, domain?.cloudflareHostnameId, updateStatus]);

  const handleRemove = async () => {
    if (!confirm(cd.confirmRemove)) return;

    setRemoving(true);
    try {
      // 1. Remove from Convex (returns CF hostname ID)
      const result = await removeDomain({});

      // 2. Remove from Cloudflare
      if (result.cloudflareHostnameId) {
        await fetch('/api/custom-domains', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cloudflareHostnameId: result.cloudflareHostnameId }),
        });
      }
    } catch {
      // Convex subscription handles UI update
    } finally {
      setRemoving(false);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const subdomainUrl = `https://${storefrontSlug}.ma5zani.com`;
  const pathUrl = `https://www.ma5zani.com/${storefrontSlug}`;

  return (
    <div className="space-y-6">
      {/* Subdomain URL (free, automatic) */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">{cd.subdomainTitle}</h3>
        <p className="text-xs text-slate-500 mb-3">{cd.subdomainDesc}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
            <a
              href={subdomainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#0054A6] hover:underline break-all flex-1"
              dir="ltr"
            >
              {storefrontSlug}.ma5zani.com
            </a>
            <button
              onClick={() => handleCopy(subdomainUrl)}
              className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-100 whitespace-nowrap"
            >
              {copied ? cd.copied : cd.copyUrl}
            </button>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
            <a
              href={pathUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#0054A6] hover:underline break-all flex-1"
              dir="ltr"
            >
              www.ma5zani.com/{storefrontSlug}
            </a>
            <button
              onClick={() => handleCopy(pathUrl)}
              className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-100 whitespace-nowrap"
            >
              {copied ? cd.copied : cd.copyUrl}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Domain */}
      <div className="border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">{cd.customDomainTitle}</h3>
        <p className="text-xs text-slate-500 mb-3">{cd.customDomainDesc}</p>

        {/* No domain yet — show input */}
        {!domain && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={hostname}
                onChange={(e) => { setHostname(e.target.value); setError(''); }}
                placeholder={cd.domainPlaceholder}
                dir="ltr"
                className="flex-1"
              />
              <Button
                onClick={handleConnect}
                disabled={connecting || !hostname.trim()}
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
              >
                {connecting ? cd.connecting : cd.connectDomain}
              </Button>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        )}

        {/* Pending / Pending Validation — show DNS instructions */}
        {domain && (domain.status === 'pending' || domain.status === 'pending_validation') && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-sm font-medium text-amber-700">{cd.statusPending}</span>
              </div>
              <p className="text-xs text-amber-700 mb-3">{cd.dnsInstructions}</p>
              <div className="bg-white rounded-lg p-3 text-xs font-mono space-y-1" dir="ltr">
                <div className="flex gap-4">
                  <span className="text-slate-500 w-12">{cd.dnsType}:</span>
                  <span className="text-slate-900 font-semibold">CNAME</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-500 w-12">{cd.dnsName}:</span>
                  <span className="text-slate-900 font-semibold">www</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-500 w-12">{cd.dnsTarget}:</span>
                  <span className="text-slate-900 font-semibold">www.ma5zani.com</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2" dir="ltr">
                {domain.hostname}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={checkCfStatus} disabled={checking} variant="secondary" size="sm">
                {checking ? cd.checking : cd.checkStatus}
              </Button>
              <Button onClick={handleRemove} disabled={removing} variant="ghost" size="sm">
                {removing ? cd.removing : cd.removeDomain}
              </Button>
            </div>
          </div>
        )}

        {/* Active — show green badge + live URL */}
        {domain && domain.status === 'active' && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium text-green-700">{cd.statusActive}</span>
              </div>
              <p className="text-xs text-green-700 mb-2">{cd.statusActiveDesc}</p>
              <div className="flex items-center gap-2 bg-white rounded-lg p-3">
                <a
                  href={`https://${domain.hostname}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#0054A6] hover:underline break-all flex-1"
                  dir="ltr"
                >
                  https://{domain.hostname}
                </a>
                <button
                  onClick={() => handleCopy(`https://${domain.hostname}`)}
                  className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 whitespace-nowrap"
                >
                  {copied ? cd.copied : cd.copyUrl}
                </button>
              </div>
            </div>

            <Button onClick={handleRemove} disabled={removing} variant="ghost" size="sm">
              {removing ? cd.removing : cd.removeDomain}
            </Button>
          </div>
        )}

        {/* Failed */}
        {domain && domain.status === 'failed' && (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-sm font-medium text-red-700">{cd.statusFailed}</span>
              </div>
              <p className="text-xs text-red-700">{cd.statusFailedDesc}</p>
              {domain.validationErrors && domain.validationErrors.length > 0 && (
                <ul className="text-xs text-red-600 mt-2 space-y-1">
                  {domain.validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={checkCfStatus} disabled={checking} variant="secondary" size="sm">
                {checking ? cd.checking : cd.checkStatus}
              </Button>
              <Button onClick={handleRemove} disabled={removing} variant="ghost" size="sm">
                {removing ? cd.removing : cd.removeDomain}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
