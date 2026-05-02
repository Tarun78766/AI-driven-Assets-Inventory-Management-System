import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  RefreshCw,
  X,
} from "lucide-react";
import { useState } from "react";
import { useMyQueries } from "./useQueries";
import { replyToQuery } from "./EmployeeQueriesAPI";

const STATUSES = ["", "Pending", "In Progress", "Resolved", "Rejected"];

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const StatusBadge = ({ status = "Pending" }) => (
  <span className={`employee-query-status ${status.toLowerCase().replace(" ", "-")}`}>
    <span />
    {status}
  </span>
);

const PriorityBadge = ({ priority = "Medium" }) => (
  <span className={`employee-query-priority-badge ${priority.toLowerCase()}`}>
    {priority}
  </span>
);

const QueryDetailModal = ({ query, onClose, onReplySuccess }) => {
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  if (!query) return null;

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setIsReplying(true);
    try {
      await replyToQuery(query._id, replyText);
      setReplyText("");
      onReplySuccess();
    } catch (err) {
      console.error("Failed to post reply", err);
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="employee-query-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="employee-query-modal-backdrop"
        onClick={onClose}
        aria-label="Close query details"
      />
      <div className="employee-query-modal-panel">
        <div className="employee-query-modal-header">
          <div>
            <div className="employee-query-card-badges">
              <StatusBadge status={query.status} />
              <PriorityBadge priority={query.priority} />
            </div>
            <h2>{query.subject}</h2>
            <p>Submitted {formatDate(query.createdAt)}</p>
          </div>
          <button type="button" className="employee-query-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="employee-query-modal-body">
          <div className="employee-query-detail-grid">
            <div>
              <span>Query Type</span>
              <strong>{query.queryType}</strong>
            </div>
            <div>
              <span>Status</span>
              <StatusBadge status={query.status} />
            </div>
          </div>

          <section>
            <h3>Initial Request</h3>
            <p className="employee-query-description">{query.description}</p>
          </section>

          {query.messages && query.messages.length > 0 && (
            <section className="employee-query-messages">
              <h3>Conversation Thread</h3>
              <div className="employee-query-thread" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                {query.messages.map((msg, idx) => (
                  <div key={idx} style={{ 
                    background: '#f8fafc', 
                    padding: '12px', 
                    borderRadius: '8px',
                    borderLeft: msg.senderRole === 'employee' ? '4px solid #cbd5e1' : '4px solid #6366f1'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                      <strong>{msg.senderName} ({msg.senderRole})</strong>
                      <span style={{ color: '#64748b' }}>{formatDate(msg.createdAt)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {query.status !== "Resolved" && query.status !== "Rejected" && (
            <section className="employee-query-reply-section" style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h3>Add a Reply</h3>
              <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={3}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  required
                />
                <button 
                  type="submit" 
                  disabled={isReplying || !replyText.trim()}
                  style={{ alignSelf: 'flex-start', padding: '8px 16px', background: '#6366f1', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  {isReplying ? "Sending..." : "Send Reply"}
                </button>
              </form>
            </section>
          )}

          {query.resolvedAt && (
            <p className="employee-query-resolved">
              Resolved on {formatDate(query.resolvedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const QueryList = () => {
  const { queries, pagination, loading, error, refetch } = useMyQueries();
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const handleFilter = (status) => {
    setFilterStatus(status);
    setPage(1);
    refetch({ status: status || undefined, page: 1 });
  };

  const handlePage = (nextPage) => {
    setPage(nextPage);
    refetch({ status: filterStatus || undefined, page: nextPage });
  };

  if (loading) {
    return (
      <div className="employee-query-loading">
        <RefreshCw className="employee-query-spin" size={34} />
        <p>Loading your queries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-query-empty">
        <p>{error}</p>
        <button type="button" className="employee-query-secondary-btn" onClick={() => refetch()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="employee-query-filter-tabs">
        {STATUSES.map((status) => (
          <button
            key={status || "all"}
            type="button"
            className={filterStatus === status ? "active" : ""}
            onClick={() => handleFilter(status)}
          >
            {status || "All"}
          </button>
        ))}
      </div>

      {queries.length === 0 ? (
        <div className="employee-query-empty">
          <div>
            <MessageSquare size={32} />
          </div>
          <h3>No queries found</h3>
          <p>
            {filterStatus
              ? `There are no ${filterStatus.toLowerCase()} queries yet.`
              : "You have not submitted any queries yet."}
          </p>
        </div>
      ) : (
        <div className="employee-query-list">
          {queries.map((query) => (
            <button
              type="button"
              key={query._id}
              className="employee-query-list-item"
              onClick={() => setSelectedQuery(query)}
            >
              <div className="employee-query-list-main">
                <div className="employee-query-card-badges">
                  <span className="employee-query-type">{query.queryType}</span>
                  <PriorityBadge priority={query.priority} />
                </div>
                <h3>{query.subject}</h3>
                <p>
                  {formatDate(query.createdAt)}
                  {query.messages && query.messages.length > 0 ? ` · ${query.messages.length} replies` : ""}
                </p>
              </div>
              <div className="employee-query-list-side">
                <StatusBadge status={query.status} />
                <ChevronRight size={18} />
              </div>
            </button>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="employee-query-pagination">
          <button
            type="button"
            className="employee-query-icon-btn"
            disabled={page === 1}
            onClick={() => handlePage(page - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            Page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong>
          </span>
          <button
            type="button"
            className="employee-query-icon-btn"
            disabled={page === pagination.totalPages}
            onClick={() => handlePage(page + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <QueryDetailModal 
        query={selectedQuery} 
        onClose={() => setSelectedQuery(null)} 
        onReplySuccess={() => {
          setSelectedQuery(null);
          refetch({ status: filterStatus || undefined, page });
        }}
      />
    </>
  );
};

export default QueryList;
