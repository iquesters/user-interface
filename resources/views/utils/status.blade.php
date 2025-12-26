<?php

use Iquesters\Foundation\Constants\EntityStatus;

$statusColor = "secondary";
$statusText = "unknown";

switch ($status) {
    case EntityStatus::NEW:
        $statusColor = "info";
        $statusText = "New";
        break;
    case EntityStatus::DRAFT:
        $statusColor = "info";
        $statusText = "Draft";
        break;
    case EntityStatus::ACTIVE:
        $statusColor = "success";
        $statusText = "Active";
        break;
    case EntityStatus::INACTIVE:
        $statusColor = "warning";
        $statusText = "Inactive";
        break;
    case EntityStatus::EXPIRED:
        $statusColor = "warning";
        $statusText = "Expired";
        break;
    case EntityStatus::DELETED:
        $statusColor = "danger";
        $statusText = "Deleted";
        break;
    case EntityStatus::PUBLISHED:
        $statusColor = "success";
        $statusText = "Published";
        break;
    case EntityStatus::UNKNOWN:
    default:
        $statusColor = "secondary";
        $statusText = "Unknown";
}
?>

<span class="badge rounded-pill py-0 text-uppercase border border-{{$statusColor}} text-{{$statusColor}} bg-{{$statusColor}}-subtle">
    <small>{{$statusText}}</small>
</span>