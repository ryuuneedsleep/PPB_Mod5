import { useState, useMemo } from 'react'
import { RefreshCw, Plus, Loader, AlertCircle, PackageOpen } from 'lucide-react'
import { useGuns } from '../hooks/useGuns'
import GUNS_LOCAL from '../data/guns'
import GunCard from '../components/gun/GunCard'
import GunDetail from '../components/gun/GunDetail'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import { archiveGun, getArchivedGuns } from '../utils/archiveStorage'
import {
  matchesSearch,
  matchesCategory,
  sortItems,
  extractCategories,
} from '../utils/helpers'

export default function Catalog({ onNavigate, onAddToCart }) {
  const { guns: apiGuns, loading, error, refetch } = useGuns({ limit: 50 })
  const [useLocal, setUseLocal] = useState(false)

  // Ambil daftar yang diarsipkan (soft-deleted)
  const archivedGuns = useMemo(() => getArchivedGuns(), [])
  const archivedIds = useMemo(() => new Set(archivedGuns.map((g) => g.id || g.name)), [archivedGuns])

  const rawGuns = useMemo(() => {
    let source = apiGuns
    if (useLocal || (error && apiGuns.length === 0)) {
      source = GUNS_LOCAL.map((g, i) => ({ ...g, id: g.id || `local-${i}` }))
    }
    // Filter Soft Delete: hilangkan yang sudah diarsipkan
    return source.filter((g) => !archivedIds.has(g.id || g.name))
  }, [apiGuns, error, useLocal, archivedIds])

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const categories = useMemo(() => extractCategories(rawGuns), [rawGuns])

  const filteredGuns = useMemo(() => {
    let result = rawGuns.filter(
      (g) => matchesSearch(g, search) && matchesCategory(g, activeCategory)
    )
    return sortItems(result, sortKey, sortOrder)
  }, [rawGuns, search, activeCategory, sortKey, sortOrder])

  const [selectedGun, setSelectedGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Soft Delete Handler
  const handleSoftDelete = () => {
    if (!deleteTarget) return
    archiveGun(deleteTarget)
    setDeleteTarget(null)
    refetch()
  }

  if (selectedGun) {
    return (
      <GunDetail
        gun={selectedGun}
        onBack={() => setSelectedGun(null)}
        onEdit={(g) => onNavigate && onNavigate('Edit', g)}
        onDelete={(g) => {
          setSelectedGun(null)
          setDeleteTarget(g)
        }}
        onAddToCart={onAddToCart}
      />
    )
  }

  return (
    <>
      <section className="masthead">
        <h1 className="display">Hardware, by the spec sheet.</h1>
        <p className="lede">
          A small armory of pistols, rifles, and shotguns. Every piece listed with its type, caliber, and price — nothing else.
        </p>
      </section>

      <section>
        <div className="list-head">
          <h2>Current stock</h2>
          <div className="list-head-right">
            <span className="count">
              {filteredGuns.length} piece{filteredGuns.length !== 1 ? 's' : ''}
            </span>
            {onNavigate && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => onNavigate('Create')}
              >
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </div>

        <AdvancedFilter
          search={search}
          onSearch={setSearch}
          categories={categories}
          activeCategory={activeCategory}
          onCategory={setActiveCategory}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={({ key, order }) => {
            setSortKey(key)
            setSortOrder(order)
          }}
        />

        {loading && (
          <div className="state-box">
            <Loader size={28} className="spin" />
            <p>Loading products from cache / server...</p>
          </div>
        )}

        {!loading && error && !useLocal && (
          <div className="state-box state-box--error">
            <AlertCircle size={28} />
            <p>{error}</p>
            <div className="state-box__actions">
              <button type="button" className="btn btn--outline" onClick={refetch}>
                <RefreshCw size={16} /> Retry
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setUseLocal(true)}
              >
                View Local Catalog
              </button>
            </div>
          </div>
        )}

        {!loading && filteredGuns.length === 0 && !error && (
          <div className="state-box">
            <PackageOpen size={28} />
            <p>No products match your search or filters.</p>
          </div>
        )}

        {filteredGuns.length > 0 && (
          <ul className="stock">
            {filteredGuns.map((gun) => (
              <GunCard
                key={gun.id || gun.name}
                gun={gun}
                onSelect={setSelectedGun}
                onEdit={onNavigate ? (g) => onNavigate('Edit', g) : undefined}
                onDelete={setDeleteTarget}
                onAddToCart={onAddToCart}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Confirm Soft Delete (Arsipkan) */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Arsipkan Senjata (Soft Delete)"
        message={`Apakah Anda yakin ingin memindahkan "${deleteTarget?.name}" ke arsip? Senjata ini dapat dipulihkan kembali dari menu Profile.`}
        confirmLabel="Arsipkan"
        danger
        onConfirm={handleSoftDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}