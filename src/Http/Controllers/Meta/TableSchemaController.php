<?php

namespace Iquesters\UserInterface\Http\Controllers\Meta;

use Iquesters\UserInterface\Constants\EntityStatus;
use App\Http\Controllers\Controller;
use Iquesters\UserInterface\Models\TableSchema;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TableSchemaController extends Controller
{

    /**
     * Display a listing of the resource.
     * 
     * @return TableSchema[]
     */
    public function list()
    {
        $tables = TableSchema::where(['status' => EntityStatus::ACTIVE])->get();

        return view('userinterface::table-schemas.list', compact('tables'));
    }

    /**
     * This is the overview page for a single table
     * 
     * @param $id
     * @return TableSchema
     */
    public function overview($id)
    {
        $table = TableSchema::find($id);

        return view('userinterface::table-schemas.overview', compact('table'));
    }

    /**
     * Show the table for creating a new table.
     */
    public function create()
    {
        return view('userinterface::table-schemas.create');
    }

    /**
     * Store a newly created table resource in storage.
     * 
     * @param $request
     */
    public function store(Request $request)
    {
        $errMsgs = [
            'name.required' => 'Please provide name',
            'schema.required' => 'Please provide schema',
        ];

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'max:190'],
            'schema' => ['required'],
        ], $errMsgs);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $slug = $request->input('slug') 
            ? Str::slug($request->input('slug')) 
            : Str::slug($request->input('name')) . '-' . Str::random(4);

        // decode schema and extra_info if JSON
        $schema = json_decode($request->input('schema'), true);
        $extra_info = json_decode($request->input('extra_info'), true);
        
        $userId = auth()->check() ? auth()->id() : 0;

        // store
        $table = TableSchema::create([
            'uid' => (string) Str::ulid(),
            'name' => $request->input('name'),
            'slug' => $slug,
            'description' => $request->input('description'),
            'schema' => $schema,
            'extra_info' => $extra_info,
            'status' => EntityStatus::ACTIVE,
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);

        if ($table) {
            return redirect()->route('table.overview', $table->id)
                ->with('success', 'Successfully created a table!');
        }

        return redirect()->back()->with('error', 'Failed to create a table!')->withInput();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($id, Request $request)
    {
        // validate payload
        $errMsgs = [
            'name.required' => 'Please provide name',
            'schema.required' => 'Please provide schema',
        ];

        $validation_expression = [
            'name' => ['required', 'max:190'],
            'schema' => ['required'],
        ];
        $validator = Validator::make($request->all(), $validation_expression, $errMsgs);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors())->withInput();
        }

        // table updated data
        // $table_data = [
        //     'name' => $request['name'],
        //     'description' => $request['description'],
        //     'schema' => $request['schema'],
        //     'extra_info' => $request['extra_info']
        // ];

        // update slug in table data
        // if (isset($request['slug'])) {
        //     $table_data['slug'] = $request['slug'];
        // }

        Log::info('table id=' . json_encode($id));
        // Log::info('table_data=' . json_encode($table_data));
        // create table
        $result = TableSchema::where(['id' => $id])->update([
            'name' => $request['name'],
            'description' => $request['description'],
            'schema' => $request['schema'],
            'extra_info' => $request['extra_info']
        ]);

        if ($result) {
            return redirect()->route('table.overview', $id)->with('success', 'Successfully updated a table!');
        } else {
            return redirect()->back()->with('error', 'Failed to update a table!')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TableSchema $tableSchema)
    {
        //
    }

    public function delete() {}
    
}