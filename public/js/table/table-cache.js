/**
 * Shared table runtime state and cache helpers.
 * This file owns in-memory table state so the constants file stays constants-only.
 */

class EntityCache {
    constructor(entity, initialPageSize = 10) {
        this.entity = entity;
        this.pageSize = initialPageSize;
        this.total = 0;
        this.cache = new Map();
        this.prefetchPromises = new Map();
    }

    set(offset, data, total) {
        if (total !== undefined) this.total = total;
        data.forEach((row, idx) => {
            this.cache.set(offset + idx, row);
        });
        console.log(`📦 Cached ${data.length} rows starting at offset ${offset} (total cached: ${this.cache.size})`);
    }

    get(start, length) {
        const result = [];
        for (let i = start; i < start + length; i++) {
            if (!this.cache.has(i)) return null;
            result.push(this.cache.get(i));
        }
        return result;
    }

    hasRange(start, length) {
        for (let i = start; i < start + length; i++) {
            if (!this.cache.has(i)) return false;
        }
        return true;
    }

    getMaxCachedOffset() {
        if (this.cache.size === 0) return 0;
        let max = 0;
        while (this.cache.has(max)) {
            max++;
        }
        return max;
    }

    shouldPrefetch(currentStart, currentLength) {
        const cachedUpTo = this.getMaxCachedOffset();
        const requestEnd = currentStart + currentLength;
        const distanceToEnd = cachedUpTo - requestEnd;
        return distanceToEnd < (currentLength * PREFETCH_THRESHOLD) && cachedUpTo < this.total;
    }

    clear() {
        this.cache.clear();
        this.prefetchPromises.clear();
        console.log(`🧹 Cache cleared for ${this.entity}`);
    }

    updateRowByUid(entityUid, nextRow) {
        if (!entityUid || !nextRow) {
            return false;
        }

        for (const [offset, cachedRow] of this.cache.entries()) {
            const cachedUid = cachedRow?.uid || cachedRow?.id || null;
            if (cachedUid === entityUid) {
                this.cache.set(offset, nextRow);
                console.log('🔄 Updated cached row by uid.', {
                    entity: this.entity,
                    entityUid,
                    offset,
                });
                return true;
            }
        }

        return false;
    }
}

const entityCaches = new Map();
const inboxViewStates = new Map();
// In-memory cache only: reused while the current page stays open.
const detailComponentTemplateCache = new Map();
const componentTemplateCache = new Map();

function clearTableCache(tableElement) {
    const sourceTable = tableElement?.__sourceTable || tableElement;
    const entity = sourceTable?.__viewManager?.entity;
    const cache = entity ? entityCaches.get(entity) : null;

    if (cache) {
        cache.clear();
    }
}
