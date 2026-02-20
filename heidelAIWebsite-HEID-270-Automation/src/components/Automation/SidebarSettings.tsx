import React, { useState, useEffect } from 'react';
import { Settings, Trash2, Copy, Info, ImageIcon, Loader2, Pencil, Search } from 'lucide-react';
import { useApi } from '@/lib/session_api';
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
  const api = useApi();
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [triggerPosts, setTriggerPosts] = useState<InstagramPost[]>([]);
  const [loadingTriggerPosts, setLoadingTriggerPosts] = useState(false);

  // Fetch Instagram posts for trigger nodes
  useEffect(() => {
    if (!node || node.type !== 'trigger') {
      setTriggerPosts([]);
      return;
    }
    const loadTriggerPosts = async () => {
      setLoadingTriggerPosts(true);
      try {
        const response = await api.get('/api/instagram/posts');

        if (response.status === 200 && response.data?.data) {
          setTriggerPosts(response.data.data);
        } else {
          setTriggerPosts([]);
        }
      } catch (error) {
        console.error('Error fetching Instagram posts for trigger:', error);
        setTriggerPosts([]);
      } finally {
        setLoadingTriggerPosts(false);
      }
    };
    loadTriggerPosts();
  }, [node?.id, node?.type, api]);

  // Fetch Instagram media for action nodes
  useEffect(() => {
    if (!node || node.app !== 'instagram' || !showMediaPicker) return;
    const load = async () => {
      setLoadingMedia(true);
      try {
        const response = await api.get('/api/instagram/posts', {
          params: { limit: 24 }
        });
        
        if (response.status === 200 && response.data?.data) {
          setInstagramPosts(response.data.data);
        } else {
          setInstagramPosts([]);
        }
      } catch (error) {
        console.error('Error fetching Instagram posts:', error);
        setInstagramPosts([]);
      } finally {
        setLoadingMedia(false);
      }
    };
    load();
  }, [node?.id, node?.app, showMediaPicker, api]);

  if (!node) return null;

  const update = (partial: Partial<EditorNode['data']>) => {
    // console.log(' Updating node data:', node.id, partial);
    onUpdateNode?.(node.id, partial);
  };

  // Determine node category
  const stepId = node.data?.stepId;
  const isTrigger = node.type === 'trigger';
  const isContentNode = stepId?.startsWith('content_');
  const isActionNode = stepId?.startsWith('action_');
  const isLogicNode = node.type === 'logic';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className={`h-14 flex items-center justify-between px-5 border-b shrink-0 rounded-t-xl ${
        isTrigger ? 'bg-blue-100 text-blue-900' :
        isLogicNode ? 'bg-amber-100 text-amber-900' :
        isActionNode ? 'bg-emerald-100 text-emerald-900' :
        'bg-purple-100 text-purple-900'
      }`}>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base">{node.label}</h3>
          <Pencil className="w-4 h-4 opacity-70" />
        </div>
        <button
          onClick={onClose}
          className="text-xs font-bold px-3 py-1.5 bg-white/80 rounded-lg hover:bg-white transition-colors"
        >
          Done
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* TRIGGER NODES */}
        {isTrigger && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">Trigger Configuration</h4>
            </div>

            {/* Post Selector */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">
                Select Instagram Post (Optional)
              </label>
              {loadingTriggerPosts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : triggerPosts.length === 0 ? (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-center">
                  <p className="text-xs text-slate-500">
                    No Instagram posts available. Connect Instagram first.
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
            </div>
            
            {/* Keywords */}
            {node.data?.triggerType !== 'instagram_ads' && (
              <div>
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
          </div>
        )}

        {/* CONTENT NODES (Send Text, Image, Card, Audio) */}
        {isContentNode && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">Message Content</h4>
            </div>

            {/* Text Input */}
            {(stepId === 'content_text' || stepId === 'content_card') && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Message Text
                </label>
                <textarea
                  className="w-full h-32 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                  placeholder="Enter your message..."
                  value={node.data?.text ?? ''}
                  onChange={(e) => update({ text: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Supports variables: {`{{trigger_data.customer_name}}`}
                </p>
              </div>
            )}

            {/* Media Picker for Image/Card nodes */}
            {(stepId === 'content_image' || stepId === 'content_card') && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Media (Image/Video)
                </label>
                {node.data?.media_url ? (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 mb-2">
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
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50"
                >
                  <ImageIcon className="w-4 h-4" />
                  {showMediaPicker ? 'Hide Instagram media' : 'Pick from Instagram'}
                </button>
                {showMediaPicker && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto mt-2">
                    {loadingMedia ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                      </div>
                    ) : instagramPosts.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2">
                        No Instagram posts found. Connect Instagram first.
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
                            className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-400 focus:border-purple-400"
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
            )}

            {/* Card Title */}
            {stepId === 'content_card' && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Card Title
                </label>
                <input
                  type="text"
                  value={node.data?.cardTitle ?? ''}
                  onChange={(e) => update({ cardTitle: e.target.value })}
                  placeholder="Enter card title"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            )}

            {/* Audio URL */}
            {stepId === 'content_audio' && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Audio URL
                </label>
                <input
                  type="url"
                  value={node.data?.audioUrl ?? ''}
                  onChange={(e) => update({ audioUrl: e.target.value })}
                  placeholder="https://example.com/audio.mp3"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  update({
                    buttons: [...(node.data?.buttons ?? []), { type: 'reply', label: 'Option', save_to_field: '' }],
                  })
                }
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300"
              >
                + Add Button
              </button>
            </div>
          </div>
        )}

        {/* ACTION NODES (Reply, Send DM, Tag, Field, API) */}
        {isActionNode && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">Action Configuration</h4>
            </div>

            {/* Reply to Comment */}
            {stepId === 'action_reply_comment' && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Reply Text
                </label>
                <textarea
                  className="w-full h-32 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  placeholder="Thank you for your comment!"
                  value={node.data?.text ?? ''}
                  onChange={(e) => update({ text: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  This will appear as a reply under the comment
                </p>
              </div>
            )}

            {/* Send DM */}
            {stepId === 'action_send_dm' && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    DM Message
                  </label>
                  <textarea
                    className="w-full h-32 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    placeholder="Hi! Thanks for your comment..."
                    value={node.data?.text ?? ''}
                    onChange={(e) => update({ text: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={node.data?.linkUrl ?? ''}
                    onChange={(e) => update({ linkUrl: e.target.value })}
                    placeholder="https://example.com/offer"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    Button Title
                  </label>
                  <input
                    type="text"
                    value={node.data?.buttonTitle ?? 'View Link'}
                    onChange={(e) => update({ buttonTitle: e.target.value })}
                    placeholder="View Offer"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </>
            )}

            {/* Add Tag */}
            {stepId === 'action_tag' && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={node.data?.tagName ?? ''}
                  onChange={(e) => update({ tagName: e.target.value })}
                  placeholder="e.g. VIP, Lead, Interested"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}

            {/* Set Field */}
            {stepId === 'action_field' && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={node.data?.fieldName ?? ''}
                    onChange={(e) => update({ fieldName: e.target.value })}
                    placeholder="e.g. email, phone, preference"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    Field Value
                  </label>
                  <input
                    type="text"
                    value={node.data?.fieldValue ?? ''}
                    onChange={(e) => update({ fieldValue: e.target.value })}
                    placeholder="Value or {{trigger_data.field}}"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </>
            )}

            {/* API / Webhook */}
            {stepId === 'action_api' && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={node.data?.apiUrl ?? ''}
                    onChange={(e) => update({ apiUrl: e.target.value })}
                    placeholder="https://api.example.com/webhook"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    Method
                  </label>
                  <select
                    value={node.data?.apiMethod ?? 'POST'}
                    onChange={(e) => update({ apiMethod: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    JSON Body (Optional)
                  </label>
                  <textarea
                    value={node.data?.apiBody ?? ''}
                    onChange={(e) => update({ apiBody: e.target.value })}
                    placeholder='{"key": "value"}'
                    rows={3}
                    className="w-full px-3 py-2 text-sm font-mono text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  />
                </div>
              </>
            )}
          </div>
        )}
        
        {/* LOGIC NODES (Delay, Condition, Randomizer) */}
        {isLogicNode && (
          <div className="space-y-4">
            {/* Delay */}
            {node.data?.logicType === 'delay' && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-3">
                <p className="text-xs font-bold text-amber-900">Delay Configuration</p>
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

            {/* Condition */}
            {node.data?.logicType === 'condition' && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-3">
                <p className="text-xs font-bold text-amber-900">Condition</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={node.data?.conditionVariable ?? ''}
                    onChange={(e) => update({ conditionVariable: e.target.value })}
                    placeholder="Variable (e.g. trigger_data.message_text)"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <select
                    value={node.data?.conditionOperator ?? 'includes'}
                    onChange={(e) => update({ conditionOperator: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="includes">Includes</option>
                    <option value="not_includes">Does not include</option>
                    <option value="equals">Equals</option>
                    <option value="not_equals">Not equals</option>
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

            {/* Randomizer */}
            {node.data?.logicType === 'randomizer' && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                <p className="text-xs font-bold text-amber-900 mb-2">A/B Split</p>
                <p className="text-xs text-slate-600">
                  Randomly sends user down one of the connected paths. Connect two or more steps from this block.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
        {/* <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50"
        >
          <Copy className="w-4 h-4" /> Duplicate
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-rose-500 text-xs font-bold hover:bg-rose-50"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button> */}
      </div>
    </div>
  );
}