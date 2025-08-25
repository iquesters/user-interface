<?php

namespace Iquesters\UserInterface\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormSchema extends Model
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
        'updated_by'
    ];

    protected $table = 'form_schemas';

    public function refCreatedBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function refUpdatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
