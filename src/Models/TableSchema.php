<?php

namespace Iquesters\UserInterface\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TableSchema extends Model
{
    use HasFactory;

    protected $fillable = [
        'uid',
        'slug',
        'name',
        'description',
        'schema',
        'extra_info',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'schema' => 'array',
        'extra_info' => 'array',
    ];
}