@extends(app('app.layout'))

@php
    $entity = ucwords(str_replace('_', ' ', $table_schema->schema['entity']));
@endphp

@section('page-title', \Iquesters\Foundation\Helpers\MetaHelper::make([$entity]))

@section('meta-description', 
    \Iquesters\Foundation\Helpers\MetaHelper::description("List view of {$entity}")
)

@section('content')
    {{-- Header with Title and View Toggle --}}
    <div class="d-flex justify-content-between align-items-center mb-1">
        <h5 class="fs-6">
            List view of {{ $entity }}
        </h5>

        @php
            $defaultView = $table_schema->schema['default_view_mode'] ?? 'table';
        @endphp

        <button type="button"
                class="btn btn-sm btn-outline-secondary"
                id="toggleViewBtn"
                title="{{ $defaultView === 'table' ? 'Switch to Split View' : 'Switch to Table View' }}">
            <i class="fas {{ $defaultView === 'table' ? 'fa-table-columns' : 'fa-table' }}"></i>
        </button>
    </div>

    {{-- Gmail-style Bulk Actions Bar with Bootstrap --}}
    <div id="bulkActionsBar" 
         class="card mb-1 border-0 shadow-sm" 
         style="display: none; position: sticky; top: 0; z-index: 1000; border-radius: 0;">

        <div class="d-flex align-items-center justify-content-between p-2">
            
            {{-- Left side - All action buttons in a single group --}}
            <div class="d-flex align-items-center">
                
                {{-- All buttons in Gmail style --}}
                <div class="btn-group shadow-none gap-2">
                    {{-- Archive --}}
                    <button type="button" 
                            id="bulkArchiveBtn"
                            class="btn btn-sm btn-outline-secondary text-muted border-0"
                            title="Archive">
                        <i class="fas fa-archive"></i>
                    </button>
                    
                    {{-- Delete --}}
                    <button type="button" 
                            id="bulkDeleteBtn"
                            class="btn btn-sm btn-outline-secondary text-muted border-0"
                            title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                    
                    {{-- Duplicate --}}
                    <button type="button" 
                            id="bulkDuplicateBtn"
                            class="btn btn-sm btn-outline-secondary text-muted border-0"
                            title="Duplicate">
                        <i class="fas fa-copy"></i>
                    </button>
                    
                    {{-- Export --}}
                    <button type="button" 
                            id="bulkExportBtn"
                            class="btn btn-sm btn-outline-secondary text-muted border-0"
                            title="Export">
                        <i class="fas fa-download"></i>
                    </button>
                    
                    {{-- Edit --}}
                    <button type="button" 
                            id="bulkEditBtn"
                            class="btn btn-sm btn-outline-secondary text-muted border-0"
                            title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    {{-- Status Dropdown Button --}}
                    <div class="btn-group">
                        <button type="button" 
                                id="bulkStatusBtn"
                                class="btn btn-sm btn-outline-secondary text-muted border-0 dropdown-toggle"
                                data-bs-toggle="dropdown"
                                aria-expanded="false">
                            <i class="fas fa-tag"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" style="border-radius: 8px; padding: 8px 0; min-width: 180px;">
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="#" onclick="event.preventDefault(); bulkActionsManager.handleStatusChange('active');">
                                    <span class="badge bg-success rounded-circle p-1" style="width: 10px; height: 10px;"></span>
                                    Active
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="#" onclick="event.preventDefault(); bulkActionsManager.handleStatusChange('pending');">
                                    <span class="badge bg-warning rounded-circle p-1" style="width: 10px; height: 10px;"></span>
                                    Pending
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="#" onclick="event.preventDefault(); bulkActionsManager.handleStatusChange('inactive');">
                                    <span class="badge bg-danger rounded-circle p-1" style="width: 10px; height: 10px;"></span>
                                    Inactive
                                </a>
                            </li>
                            <li><hr class="dropdown-divider my-2"></li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="#" onclick="event.preventDefault(); bulkActionsManager.handleStatusChange('completed');">
                                    <span class="badge bg-primary rounded-circle p-1" style="width: 10px; height: 10px;"></span>
                                    Completed
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    {{-- Assign Dropdown Button --}}
                    <div class="btn-group">

                        <button type="button" 
                                id="bulkAssignBtn"
                                class="btn btn-sm btn-outline-secondary text-muted border-0 dropdown-toggle"
                                data-bs-toggle="dropdown"
                                aria-expanded="false">
                            <i class="fas fa-user-tag"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" style="border-radius: 8px; padding: 8px 0; min-width: 200px;">
                            <li>
                                <a class="dropdown-item py-2" href="#" onclick="event.preventDefault(); bulkActionsManager.handleAssign('me');">
                                    <i class="fas fa-user me-2 text-primary"></i>
                                    Assign to me
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item py-2" href="#" onclick="event.preventDefault(); bulkActionsManager.showAssignModal();">
                                    <i class="fas fa-user-plus me-2 text-success"></i>
                                    Assign to someone...
                                </a>
                            </li>
                            <li><hr class="dropdown-divider my-2"></li>
                            <li>
                                <a class="dropdown-item py-2 text-muted" href="#" onclick="event.preventDefault(); bulkActionsManager.handleAssign('unassigned');">
                                    <i class="fas fa-user-slash me-2"></i>
                                    Mark as unassigned
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    {{-- More Actions Dropdown --}}
                    <div class="btn-group">
                        <button type="button" 
                                class="btn btn-sm btn-outline-secondary text-muted border-0 dropdown-toggle"
                                id="bulkMoreBtn"
                                data-bs-toggle="dropdown"
                                aria-expanded="false">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" style="border-radius: 8px; padding: 8px 0; min-width: 180px;">
                            <li>
                                <a class="dropdown-item py-2" href="#" onclick="event.preventDefault(); bulkActionsManager.handleMarkAsRead();">
                                    <i class="fas fa-envelope-open me-2"></i>
                                    Mark as read
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item py-2" href="#" onclick="event.preventDefault(); bulkActionsManager.handleMarkAsUnread();">
                                    <i class="fas fa-envelope me-2"></i>
                                    Mark as unread
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item py-2" href="#" onclick="event.preventDefault(); bulkActionsManager.handleStar();">
                                    <i class="fas fa-star me-2 text-warning"></i>
                                    Add star
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item py-2" href="#" onclick="event.preventDefault(); bulkActionsManager.handleRemoveStar();">
                                    <i class="far fa-star me-2"></i>
                                    Remove star
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item py-2 text-danger" href="#" onclick="event.preventDefault(); bulkActionsManager.handleSpam();">
                                    <i class="fas fa-ban me-2"></i>
                                    Report spam
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {{-- Right side - Selection info and Clear button --}}
            <div class="d-flex align-items-center gap-2">
                <span id="selectionCount">0 selected</span>
                <button type="button"
                        id="bulkClearSelectionBtn"
                        class="btn btn-sm btn-link text-decoration-none p-0">
                    Clear
                </button>
            </div>
        </div>
    </div>

    {{-- DataTable --}}
    <table id="{{ $table_schema->uid }}" class="lab-table"></table>
@endsection