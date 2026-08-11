import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createShare } from "../../services/shareService";
import { canEdit, isOwner } from "../../services/permissionService";
import MemberModal from "../MemberModal";
import { getTripCover } from "./tripCovers";

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "";
  if (!endDate) return startDate;
  return `${startDate} ～ ${endDate}`;
}

export default function TripHeader({ trip, readonly = false, showAI = true }) {
  const { id } = useParams();
  const [showMemberModal, setShowMemberModal] = useState(false);
  const cover = getTripCover(trip?.country);
  const editable = !readonly && canEdit(trip);
  const owner = isOwner(trip);

  async function handleShare() {
    try {
      const shareId = Math.random().toString(36).substring(2, 10).toUpperCase();
      await createShare(shareId, trip);
      const url = `${window.location.origin}/share/${shareId}`;
      await navigator.clipboard.writeText(url);
      alert(`分享連結已複製！\n\n${url}`);
    } catch (error) {
      console.error(error);
      alert("分享失敗");
    }
  }

  return (
    <header className="tm-trip-header">
      <div
        className="tm-trip-cover"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(247,250,255,0.48) 0%, rgba(247,250,255,0.72) 62%, rgba(247,250,255,0.98) 100%), url(${cover.image})`,
          backgroundPosition: cover.position,
        }}
      >
        <div className="tm-trip-cover-inner">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="tm-back-link">← 回首頁</Link>
            {showAI && !readonly && (
              <Link
                to={`/trip/${id}/itinerary?ai=1`}
                aria-label="AI 規劃行程"
                title="AI 規劃行程"
                className="tm-ai-button"
              >
                <img src="/ai-robot.svg" alt="" aria-hidden="true" />
              </Link>
            )}
          </div>

          <div className="mt-8 pr-20 sm:mt-10">
            <h1 className="tm-trip-title">{trip.title}</h1>
            <div className="tm-trip-meta mt-3">
              <span>📍 {trip.country || "未設定國家"}{trip.city ? ` · ${trip.city}` : ""}</span>
              <span>📅 {formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {editable && (
        <div className="tm-trip-actions">
          <button type="button" onClick={handleShare} className="tm-action-card tm-action-share">
            <span className="tm-action-icon">🔗</span>
            <span className="min-w-0">
              <strong>分享行程</strong>
              <small>與家人朋友分享</small>
            </span>
          </button>
          <button type="button" onClick={() => setShowMemberModal(true)} className="tm-action-card tm-action-member">
            <span className="tm-action-icon">👥</span>
            <span className="min-w-0">
              <strong>成員管理</strong>
              <small>查看同行成員</small>
            </span>
          </button>
        </div>
      )}

      {editable && showMemberModal && (
        <MemberModal
          trip={trip}
          owner={owner}
          onClose={() => setShowMemberModal(false)}
        />
      )}
    </header>
  );
}
