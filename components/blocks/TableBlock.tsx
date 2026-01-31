'use client';

interface TableBlockProps {
    value: string;
    onChange: (val: string) => void;
}

export default function TableBlock({ value, onChange }: TableBlockProps) {
    let data: string[][] = [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']];
    try { 
        const parsed = JSON.parse(value); 
        if (Array.isArray(parsed) && Array.isArray(parsed[0])) data = parsed; 
    } catch {}

    const updateCell = (rowIndex: number, colIndex: number, cellValue: string) => { 
        const newData = [...data]; 
        newData[rowIndex] = [...newData[rowIndex]]; 
        newData[rowIndex][colIndex] = cellValue; 
        onChange(JSON.stringify(newData)); 
    };

    const addRow = () => { 
        const cols = data[0].length; 
        onChange(JSON.stringify([...data, Array(cols).fill('')])); 
    };

    const addCol = () => { 
        onChange(JSON.stringify(data.map(row => [...row, '']))); 
    };

    const removeRow = (index: number) => { 
        if (data.length <= 1) return; 
        onChange(JSON.stringify(data.filter((_, i) => i !== index))); 
    };

    const removeCol = (index: number) => { 
        if (data[0].length <= 1) return; 
        onChange(JSON.stringify(data.map(row => row.filter((_, i) => i !== index)))); 
    };

    return (
        <div className="overflow-x-auto border border-base-300 rounded-xl p-3 bg-base-100/50 shadow-inner">
            <table className="table table-sm w-full font-sans text-sm">
                <tbody>
                    {data.map((row, rIndex) => (
                        <tr key={rIndex} className="group/row">
                            {row.map((cell, cIndex) => (
                                <td key={cIndex} className={`p-0 border border-base-200 relative group/cell ${rIndex === 0 ? 'bg-base-200/50 font-bold' : ''}`}>
                                    <input 
                                        className="w-full h-full bg-transparent px-3 py-2.5 outline-none min-w-[120px] focus:bg-primary/5" 
                                        value={cell} 
                                        onChange={(e) => updateCell(rIndex, cIndex, e.target.value)} 
                                        placeholder={rIndex === 0 ? "Header" : "..."} 
                                    />
                                    {rIndex === 0 && (
                                        <button 
                                            onClick={() => removeCol(cIndex)} 
                                            className="btn btn-xs btn-square btn-ghost absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/cell:opacity-100 text-error scale-75 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    )}
                                </td>
                            ))}
                            <td className="w-8 p-0 border-none bg-transparent opacity-0 group-hover/row:opacity-100 transition-opacity text-center">
                                <button onClick={() => removeRow(rIndex)} className="btn btn-xs btn-ghost text-error">×</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex gap-2 mt-3 ml-1">
                <button onClick={addRow} className="btn btn-xs btn-ghost border border-base-300 hover:bg-base-200 font-bold uppercase tracking-widest text-[9px]">+ Row</button>
                <button onClick={addCol} className="btn btn-xs btn-ghost border border-base-300 hover:bg-base-200 font-bold uppercase tracking-widest text-[9px]">+ Column</button>
            </div>
        </div>
    );
}
