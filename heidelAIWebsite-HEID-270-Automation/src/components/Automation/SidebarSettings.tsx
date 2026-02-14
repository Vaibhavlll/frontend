import React, { useState, useEffect } from 'react';
import { Settings, Trash2, Copy, Info, ImageIcon, Loader2, Pencil, Search } from 'lucide-react';
import { getData, DB_KEYS } from '@/lib/indexedDB';
import type { EditorNode } from './flowExport';

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption: string;
  media_type: string;
  thumbnail_url?: string;
  timestamp: string;
}

interface SidebarSettingsProps {
  node: EditorNode | null | undefined;
  onClose: () => void;
  onUpdateNode?: (nodeId: string, dataPartial: Partial<EditorNode['data']>) => void;
}

export default function SidebarSettings({ node, onClose, onUpdateNode }: SidebarSettingsProps) {
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [triggerPosts, setTriggerPosts] = useState<InstagramPost[]>([]);
  const [loadingTriggerPosts, setLoadingTriggerPosts] = useState(false);

  // Fetch Instagram posts for trigger nodes (always load when trigger is selected)
  useEffect(() => {
    if (!node || node.type !== 'trigger') {
      setTriggerPosts([]);
      return;
    }
    const loadTriggerPosts = async () => {
      setLoadingTriggerPosts(true);
      try {
        const data = await getData<{ posts: InstagramPost[] }>(
          'integrations',
          DB_KEYS.INTEGRATIONS.INSTAGRAM_POSTS
        );
        setTriggerPosts(data?.posts ?? []);
      } catch {
        setTriggerPosts([]);
      } finally {
        setLoadingTriggerPosts(false);
      }
    };
    loadTriggerPosts();
  }, [node?.id, node?.type]);

  // Fetch Instagram media from IndexedDB for action nodes
  useEffect(() => {
    if (!node || node.app !== 'instagram' || !showMediaPicker) return;
    const load = async () => {
      setLoadingMedia(true);
      try {
        const data = await getData<{ posts: InstagramPost[] }>(
          'integrations',
          DB_KEYS.INTEGRATIONS.INSTAGRAM_POSTS
        );
        setInstagramPosts(data?.posts ?? []);
      } catch {
        setInstagramPosts([]);
      } finally {
        setLoadingMedia(false);
      }
    };
    load();
  }, [node?.id, node?.app, showMediaPicker]);

  if (!node) return null;

  const update = (partial: Partial<EditorNode['data']>) => {
    onUpdateNode?.(node.id, partial);
  };

  const isSendMessage = node.app === 'instagram' && (!node.data?.contentKind || node.data?.contentKind === 'text');
  const isCondition = node.type === 'logic' && node.data?.logicType === 'condition';
  const isActionsPanel = node.label === 'Actions' || node.data?.logicType === 'actions';
  const isActionsNode = node.type === 'action' && (node.data?.actionType === 'add_tag' || node.data?.actionType === 'set_field' || node.data?.actionType === 'api');
  
  // NEW: Check for reply_to_comment and send_dm action types
  const isReplyToComment = node.type === 'action' && node.data?.actionType === 'reply_to_comment';
  const isSendDm = node.type === 'action' && node.data?.actionType === 'send_dm';

  const headerBg = isSendMessage ? 'bg-purple-100' : isCondition ? 'bg-teal-100' : (isActionsPanel || isActionsNode) ? 'bg-amber-100' : 'bg-slate-100';
  const headerText = isSendMessage ? 'text-purple-900' : isCondition ? 'text-teal-900' : (isActionsPanel || isActionsNode) ? 'text-amber-900' : 'text-slate-800';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sidebar Header */}
      <div className={`h-14 flex items-center justify-between px-5 border-b border-white/50 shrink-0 rounded-t-xl ${headerBg} ${headerText}`}>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base">{node.label}</h3>
          <Pencil className="w-4 h-4 opacity-70" />
        </div>
        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-600 hover:text-slate-800 px-3 py-1.5 bg-white/80 rounded-lg transition-colors"
        >
          Done
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* ============================================================================ */}
        {/* INSTAGRAM POST SELECTOR FOR TRIGGERS */}
        {/* ============================================================================ */}
        {node.type === 'trigger' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">Select Instagram Post</h4>
            </div>
            {loadingTriggerPosts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : triggerPosts.length === 0 ? (
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-center">
                <p className="text-xs text-slate-500">
                  No Instagram posts available. Connect Instagram in Settings first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {triggerPosts.map((post) => {
                  const isSelected = node.data?.triggerConfig?.post_id === post.id;
                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => {
                        update({
                          triggerConfig: {
                            ...node.data?.triggerConfig,
                            post_id: isSelected ? undefined : post.id,
                          },
                          triggerSubtitle: isSelected ? undefined : `Post: ${post.caption?.substring(0, 30)}...`
                        });
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <img
                        src={
                          post.media_type === 'VIDEO'
                            ? post.thumbnail_url || post.media_url
                            : post.media_url
                        }
                        alt={post.caption || 'Post'}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Keywords for triggers */}
            {node.data?.triggerType !== 'instagram_ads' && (
              <div className="mt-4">
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Keywords (optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={(node.data?.triggerConfig?.keywords ?? []).join(', ')}
                  onChange={(e) =>
                    update({
                      triggerConfig: {
                        ...node.data?.triggerConfig,
                        keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g. price, discount, info"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Trigger only when comment contains these keywords
                </p>
              </div>
            )}
            <hr className="border-slate-100" />
          </div>
        )}

        {/* ============================================================================ */}
        {/* REPLY TO COMMENT ACTION */}
        {/* ============================================================================ */}
        {isReplyToComment && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">Reply to Comment</h4>
            </div>
            <p className="text-xs text-slate-600">
              This action will reply directly to the Instagram comment that triggered the automation.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 block">Reply Text</label>
              <textarea
                className="w-full h-32 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                placeholder="Thank you for your comment! We'll get back to you soon..."
                value={node.data?.text ?? ''}
                onChange={(e) => update({ text: e.target.value })}
              />
              <p className="text-xs text-slate-500">
                This message will appear as a reply under the comment
              </p>
            </div>
          </div>
        )}

        {/* ============================================================================ */}
        {/* SEND DM ACTION */}
        {/* ============================================================================ */}
        {isSendDm && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">Send Direct Message</h4>
            </div>
            <p className="text-xs text-slate-600">
              Send a private message to the user's Instagram inbox.
            </p>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 block">Message Text</label>
              <textarea
                className="w-full h-32 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                placeholder="Hi! Thanks for reaching out..."
                value={node.data?.text ?? ''}
                onChange={(e) => update({ text: e.target.value })}
              />
            </div>

            {/* Optional link button */}
            {/* <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-2">
                <input
                  type="checkbox"
                  checked={node.data?.includeButton ?? false}
                  onChange={(e) => update({ includeButton: e.target.checked })}
                  className="rounded"
                />
                Include a button link
              </label>
              
              {node.data?.includeButton && (
                <div className="space-y-2 mt-2">
                  <input
                    type="text"
                    value={(node.data?.buttonTitle as string) ?? ''}
                    onChange={(e) => update({ buttonTitle: e.target.value })}
                    placeholder="Button text (e.g. Visit Website)"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="url"
                    value={(node.data?.linkUrl as string) ?? ''}
                    onChange={(e) => update({ linkUrl: e.target.value })}
                    placeholder="https://your-website.com"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}
            </div> */}

            {/* Instagram media picker */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 block">Media (optional)</label>
              {node.data?.media_url ? (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <img
                    src={node.data.media_url}
                    alt="Selected"
                    className="w-12 h-12 object-cover rounded"
                  />
                  <span className="text-xs text-slate-600 truncate flex-1">Image attached</span>
                  <button
                    type="button"
                    onClick={() => update({ media_url: null })}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setShowMediaPicker((v) => !v)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <ImageIcon className="w-4 h-4" />
                {showMediaPicker ? 'Hide Instagram media' : 'Pick from Instagram'}
              </button>
              {showMediaPicker && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto">
                  {loadingMedia ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                  ) : instagramPosts.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-2">
                      No Instagram posts in Settings. Connect Instagram in Settings first.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {instagramPosts.map((post) => (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => {
                            update({ media_url: post.media_url });
                            setShowMediaPicker(false);
                          }}
                          className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-400 focus:border-indigo-400 focus:outline-none"
                        >
                          <img
                            src={
                              post.media_type === 'VIDEO'
                                ? post.thumbnail_url || post.media_url
                                : post.media_url
                            }
                            alt={post.caption || 'Post'}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Send Message */}
        {isSendMessage && !isReplyToComment && !isSendDm && (
          <>
            <p className="text-sm text-slate-700">
              Send as{' '}
              <button type="button" className="text-indigo-600 hover:underline font-medium">
                Private Reply
              </button>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] ml-1 cursor-help">?</span>
            </p>
            <textarea
              className="w-full h-36 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
              placeholder="Enter your text..."
              value={node.data?.text ?? ''}
              onChange={(e) => update({ text: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                + Add Button
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                + Add Quick Reply
              </button>
            </div>
          </>
        )}

        {/* Condition */}
        {isCondition && (
          <>
            <p className="text-sm text-slate-700">
              Does the contact match{' '}
              <button type="button" className="text-indigo-600 hover:underline font-medium">
                all of the following conditions?
              </button>
            </p>
            <button
              type="button"
              className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              + Condition
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conditions..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
              <button type="button" className="flex-1 py-1.5 rounded-md text-xs font-medium bg-white shadow text-slate-800">
                Recommended
              </button>
              <button type="button" className="flex-1 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-white/50">
                General Filters
              </button>
              <button type="button" className="flex-1 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-white/50">
                System Fields
              </button>
            </div>
            <div className="space-y-2">
              {['Tag – Check if a contact has a specific tag.', 'Email – Check if a contact\'s email is known.', 'Follows your Instagram account – Check if a contact is your follower.'].map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-left text-sm text-slate-700"
                >
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">🏷</span>
                  <span>{item.split(' – ')[0]}</span>
                  <span className="text-slate-500 text-xs">{item.split(' – ')[1]}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Actions node */}
        {isActionsPanel && (
          <>
            <p className="text-sm text-slate-700">Perform following actions:</p>
            <button
              type="button"
              className="w-full py-2.5 border-2 border-dashed border-amber-200 rounded-xl text-sm font-medium text-amber-700 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
            >
              + Action
            </button>
            <button
              type="button"
              className="w-full py-2.5 border-2 border-dashed border-emerald-200 rounded-xl text-sm font-medium text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
            >
              Choose Next Step
            </button>
          </>
        )}

        {/* Generic / other nodes */}
        {!isSendMessage && !isCondition && !isActionsPanel && !isReplyToComment && !isSendDm && (
        <>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 ml-1">Step Name</label>
          <input
            type="text"
            value={node.data?.stepName ?? node.description ?? ''}
            onChange={(e) => update({ stepName: e.target.value })}
            className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
            placeholder="e.g. Send Welcome Message"
          />
        </div>
        <hr className="border-slate-100" />
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-bold text-slate-800 uppercase">Configuration</h4>
          </div>

          {node.app === 'instagram' && (!node.data?.contentKind || node.data?.contentKind === 'text') && !isSendMessage && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-500 block">Message Text</label>
              <textarea
                className="w-full h-32 px-4 py-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                placeholder="Enter your text..."
                value={node.data?.text ?? ''}
                onChange={(e) => update({ text: e.target.value })}
              />
              
              {/* Instagram media picker */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 block">Media (optional)</label>
                {node.data?.media_url ? (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <img
                      src={node.data.media_url}
                      alt="Selected"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="text-xs text-slate-600 truncate flex-1">Image attached</span>
                    <button
                      type="button"
                      onClick={() => update({ media_url: null })}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowMediaPicker((v) => !v)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                  {showMediaPicker ? 'Hide Instagram media' : 'Pick from Instagram'}
                </button>
                {showMediaPicker && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto">
                    {loadingMedia ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      </div>
                    ) : instagramPosts.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2">
                        No Instagram posts in Settings. Connect Instagram in Settings first.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {instagramPosts.map((post) => (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => {
                              update({ media_url: post.media_url });
                              setShowMediaPicker(false);
                            }}
                            className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-400 focus:border-indigo-400 focus:outline-none"
                          >
                            <img
                              src={
                                post.media_type === 'VIDEO'
                                  ? post.thumbnail_url || post.media_url
                                  : post.media_url
                              }
                              alt={post.caption || 'Post'}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    update({
                      buttons: [...(node.data?.buttons ?? []), { type: 'reply', label: 'Option', save_to_field: '' }],
                    })
                  }
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  + Add Button
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  + Quick Reply
                </button>
              </div>
            </div>
          )}

          {node.type === 'logic' && node.data?.logicType === 'delay' && (
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 space-y-3">
              <p className="text-xs font-medium text-amber-800">Delay</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={1}
                  value={node.data?.delayAmount ?? 5}
                  onChange={(e) => update({ delayAmount: Number(e.target.value) || 1 })}
                  className="w-20 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <select
                  value={node.data?.delayUnit ?? 'minutes'}
                  onChange={(e) =>
                    update({ delayUnit: e.target.value as 'seconds' | 'minutes' | 'hours' })
                  }
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                </select>
              </div>
            </div>
          )}

          {node.type === 'logic' && node.data?.logicType === 'condition' && (
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 space-y-3">
              <p className="text-xs font-medium text-amber-800">Condition</p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={node.data?.conditionVariable ?? ''}
                  onChange={(e) => update({ conditionVariable: e.target.value })}
                  placeholder="Variable (e.g. user_tags)"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <select
                  value={node.data?.conditionOperator ?? 'includes'}
                  onChange={(e) => update({ conditionOperator: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="includes">Includes</option>
                  <option value="not_includes">Does not include</option>
                  <option value="is_empty">Is empty</option>
                </select>
                <input
                  type="text"
                  value={node.data?.conditionValue ?? ''}
                  onChange={(e) => update({ conditionValue: e.target.value })}
                  placeholder="Value"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          )}

          {node.type === 'logic' && node.data?.logicType === 'randomizer' && (
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 space-y-3">
              <p className="text-xs font-medium text-amber-800">Randomizer (A/B Split)</p>
              <p className="text-[11px] text-slate-600">Randomly sends user down one of the connected paths. Connect two or more steps from this block.</p>
            </div>
          )}

          {node.data?.actionType === 'add_tag' && (
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-3">
              <p className="text-xs font-medium text-emerald-800">Add Tag</p>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 block">Tag name</label>
                <input
                  type="text"
                  value={(node.data?.tagName as string) ?? ''}
                  onChange={(e) => update({ tagName: e.target.value })}
                  placeholder="e.g. VIP, Lead"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          )}

          {node.data?.actionType === 'set_field' && (
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-3">
              <p className="text-xs font-medium text-emerald-800">Set Custom Field</p>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 block">Field name</label>
                <input
                  type="text"
                  value={(node.data?.fieldName as string) ?? ''}
                  onChange={(e) => update({ fieldName: e.target.value })}
                  placeholder="e.g. email, phone"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <label className="text-xs font-medium text-slate-600 block">Value</label>
                <input
                  type="text"
                  value={(node.data?.fieldValue as string) ?? ''}
                  onChange={(e) => update({ fieldValue: e.target.value })}
                  placeholder="Value or {{variable}}"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          )}

          {node.data?.actionType === 'api' && (
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-3">
              <p className="text-xs font-medium text-emerald-800">HTTP Request (Webhook)</p>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 block">URL</label>
                <input
                  type="url"
                  value={(node.data?.apiUrl as string) ?? ''}
                  onChange={(e) => update({ apiUrl: e.target.value })}
                  placeholder="https://api.example.com/webhook"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <label className="text-xs font-medium text-slate-600 block">Method</label>
                <select
                  value={(node.data?.apiMethod as string) ?? 'POST'}
                  onChange={(e) => update({ apiMethod: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
                <label className="text-xs font-medium text-slate-600 block">JSON Body (optional)</label>
                <textarea
                  value={(node.data?.apiBody as string) ?? ''}
                  onChange={(e) => update({ apiBody: e.target.value })}
                  placeholder='{"key": "value"}'
                  rows={3}
                  className="w-full px-3 py-2 text-sm font-mono text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>
            </div>
          )}

          {(node.data?.contentKind === 'image' || node.data?.contentKind === 'card' || node.data?.contentKind === 'audio') && node.app === 'instagram' && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-500 block">
                {node.data?.contentKind === 'image' && 'Image'}
                {node.data?.contentKind === 'card' && 'Card (title + media)'}
                {node.data?.contentKind === 'audio' && 'Audio'}
              </label>
              {node.data?.contentKind !== 'audio' && (
                <>
                  {node.data?.media_url ? (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <img src={node.data.media_url} alt="Selected" className="w-12 h-12 object-cover rounded" />
                      <span className="text-xs text-slate-600 truncate flex-1">Media attached</span>
                      <button type="button" onClick={() => update({ media_url: null })} className="text-xs font-bold text-rose-500 hover:text-rose-600">Remove</button>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker((v) => !v)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <ImageIcon className="w-4 h-4" />
                    {showMediaPicker ? 'Hide' : 'Pick from Instagram'}
                  </button>
                  {showMediaPicker && (
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto">
                      {loadingMedia ? (
                        <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
                      ) : instagramPosts.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-2">Connect Instagram in Settings first.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {instagramPosts.map((post) => (
                            <button
                              key={post.id}
                              type="button"
                              onClick={() => { update({ media_url: post.media_url }); setShowMediaPicker(false); }}
                              className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-400 focus:border-indigo-400 focus:outline-none"
                            >
                              <img src={post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              {node.data?.contentKind === 'card' && (
                <input
                  type="text"
                  value={(node.data?.cardTitle as string) ?? ''}
                  onChange={(e) => update({ cardTitle: e.target.value })}
                  placeholder="Card title"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              )}
              {node.data?.contentKind === 'audio' && (
                <input
                  type="text"
                  value={(node.data?.audioUrl as string) ?? ''}
                  onChange={(e) => update({ audioUrl: e.target.value })}
                  placeholder="Audio URL"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              )}
            </div>
          )}
        </div>
        </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
        >
          <Copy className="w-4 h-4" /> Duplicate
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-rose-500 text-xs font-bold hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  );
}