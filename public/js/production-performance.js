class PerformanceEntry {
    URL
    startTimestamp
    endTimestamp
    loadTime

    constructor(data) {
        this.URL = data.URL
        this.startTimestamp = data.startTimestamp
        this.endTimestamp = data.endTimestamp
        this.loadTime = data.loadTime
    }
}

const CURRENT_PERFORMANCE_ENTRY_KEY = "current-performance-entry"

window.addEventListener('pagehide', () => {
    let currPE = new PerformanceEntry({
        startTimestamp: Date.now()
    })

    localStorage.setItem(CURRENT_PERFORMANCE_ENTRY_KEY, JSON.stringify(currPE))
})

window.addEventListener('load', () => {
    let currPEData = localStorage.getItem(CURRENT_PERFORMANCE_ENTRY_KEY)
    let currPE = currPEData ? JSON.parse(currPEData) : {}

    currPE.URL = window.location.toString()
    currPE.endTimestamp = Date.now()
    currPE.startTimestamp = currPE.startTimestamp || currPE.endTimestamp
    currPE.loadTime = currPE.endTimestamp - currPE.startTimestamp

    console.log("Recent Performance Entry: " + JSON.stringify(currPE, null, 2))
    console.log("Recent load time: " + (currPE.loadTime / 1000).toFixed(2) + "secs")

    localStorage.setItem(CURRENT_PERFORMANCE_ENTRY_KEY, JSON.stringify(currPE))
})