import React, { useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';

interface Product {
  id: number;
  name: string;
  productNo: string;
  category: string;
  price: string;
  date: string;
  stock: number;
  image: string;
}

const ProductTable = () => {
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const [filterText, setFilterText] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [exportFormat, setExportFormat] = useState('Export');
  const [activeFilter, setActiveFilter] = useState('All 250');

  const data: Product[] = [
    { id: 1, name: 'Blue Blue Gradient iPhone Case', productNo: '#87845', category: 'Electronics', price: '$200', date: '03/02/2022', stock: 250, image: '/assets/images-dashboard/grocery/15.png' },
    { id: 2, name: 'Green Blue Gradient iPhone Case', productNo: '#87845', category: 'Electronics', price: '$120', date: '03/02/2022', stock: 250, image: '/assets/images-dashboard/grocery/15.png' },
    { id: 3, name: 'Hree Blue Gradient iPhone Case', productNo: '#87845', category: 'Electronics', price: '$125', date: '03/02/2022', stock: 250, image: '/assets/images-dashboard/grocery/17.png' },
    { id: 4, name: 'Kabir Blue Gradient iPhone Case', productNo: '#87845', category: 'Electronics', price: '$133', date: '03/02/2022', stock: 250, image: '/assets/images-dashboard/grocery/18.png' },
    { id: 5, name: 'leer Blue Gradient iPhone Case', productNo: '#87845', category: 'Electronics', price: '$132', date: '03/02/2022', stock: 250, image: '/assets/images-dashboard/grocery/19.png' },
    { id: 6, name: 'Purple Blue Gradient iPhone Case', productNo: '#87845', category: 'Electronics', price: '$200', date: '03/02/2022', stock: 250, image: '/assets/images-dashboard/grocery/14.png' },
    { id: 7, name: 'Purple Blue Gradient iPhone Case', productNo: '#87845', category: 'Electronics', price: '$200', date: '03/02/2022', stock: 250, image: '/assets/images-dashboard/grocery/17.png' },
    { id: 8, name: 'Purple Blue Gradient iPhone Case', productNo: '#87845', category: 'Electronics', price: '$200', date: '03/02/2022', stock: 250, image: '/assets/images-dashboard/grocery/18.png' },
    { id: 9, name: 'Purple Blue Gradient iPhone Case', productNo: '#87845', category: 'Electronics', price: '$200', date: '03/02/2022', stock: 250, image: '/assets/images-dashboard/grocery/17.png' },
    { id: 10, name: 'Purple Blue Gradient iPhone Case', productNo: '#87845', category: 'Electronics', price: '$200', date: '03/02/2022', stock: 250, image: '/assets/images-dashboard/grocery/19.png' },
  ];

  const columns: TableColumn<Product>[] = [
    {
      name: 'Product Name',
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <div className="item-check-area-table-left">
          <div className="item-name-and-check-table">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={selectedRows.some(selected => selected.id === row.id)}
                onChange={() => { }}
              />
            </div>
          </div>
          <div className="item-image-and-name">
            <a href="#" className="thumbnail">
              <img src={row.image} alt="grocery" />
            </a>
            <p>{row.name}</p>
          </div>
        </div>
      ),
      width: '30%',
    },
    {
      name: 'Product No',
      selector: row => row.productNo,
      sortable: true,
      cell: row => <p>{row.productNo}</p>,
    },
    {
      name: 'Category',
      selector: row => row.category,
      sortable: true,
      cell: row => (
        <div className="payment d-flex align-items-center">
          <p>{row.category}</p>
        </div>
      ),
    },
    {
      name: 'Price',
      selector: row => row.price,
      sortable: true,
      cell: row => <p>{row.price}</p>,
    },
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
      cell: row => <p>{row.date}</p>,
    },
    {
      name: 'Stock',
      selector: row => row.stock,
      sortable: true,
      cell: row => (
        <div className="between-stock-table action text-end">
          <p>{row.stock}</p>
          <img src="/assets/images-dashboard/grocery/20.png" alt="grocery" />
          <div className="action-edit-deleate">
            <span>Edit</span>
            <span>Delete</span>
          </div>
        </div>
      ),
    },
  ];

  const filteredItems = data.filter(
    item =>
      item.name.toLowerCase().includes(filterText.toLowerCase()) ||
      item.productNo.toLowerCase().includes(filterText.toLowerCase()) ||
      item.category.toLowerCase().includes(filterText.toLowerCase()) ||
      item.price.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleExport = (format: string) => {
    setExportFormat(format);
    console.log(`Exporting as ${format}`);
  };

  const handleAddProduct = () => {
    console.log('Add new product');
  };

  const handleEdit = (id: number) => {
    console.log(`Editing product ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Deleting product ${id}`);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <div className="body-root-inner">
      <div className="transection">
        <div className="title-right-actioin-btn-wrapper-product-list">
          <h3 className="title">Product</h3>
          <div className="button-wrapper">
            <div className="single-select">
              <select className="nice-select">
                <option>Week</option>
                <option>Month</option>
                <option>Year</option>
                <option>6 Month</option>
              </select>
            </div>
            <button
              className="rts-btn btn-primary menu-btn"
              onClick={handleAddProduct}
            >
              + Add
            </button>
          </div>
        </div>

        <div className="product-top-filter-area-l">
          <div className="left-area-button-fiulter">
            {['All 250', 'New Item 150', 'Disabled 154'].map((filter) => (
              <div
                key={filter}
                className={`signle-product-single-button ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => handleFilterChange(filter)}
              >
                <span>{filter}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="vendor-list-main-wrapper product-wrapper">
          <div className="card-body table-product-select">
            <div className="table-responsive">
              <div id="example_wrapper" className="dataTables_wrapper no-footer">
                <div className="dataTables_length" id="example_length">
                  <label>
                    Show{' '}
                    <select
                      name="example_length"
                      aria-controls="example"
                      className=""
                      value={rowsPerPage}
                      onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    >
                      {[5, 10, 15, 20].map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>{' '}
                    entries
                  </label>
                </div>
                <div id="example_filter" className="dataTables_filter">
                  <label>
                    Search:
                    <input
                      type="search"
                      className=""
                      placeholder=""
                      aria-controls="example"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                    />
                  </label>
                </div>

                <DataTable
                  columns={columns}
                  data={filteredItems}
                  selectableRows
                  onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                  pagination
                  paginationPerPage={rowsPerPage}
                  paginationRowsPerPageOptions={[5, 10, 15, 20]}
                  paginationComponentOptions={{
                    rowsPerPageText: 'Show',
                    rangeSeparatorText: 'of',
                  }}
                  noDataComponent="No products found"
                  className="table table-hover dataTable no-footer"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-copyright">
        <div className="left">
          <p>Copyright © 2025 All Right Reserved.</p>
        </div>
        <ul>
          <li><a href="#">Terms</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Help</a></li>
        </ul>
      </div>
    </div>
  );
};

export default ProductTable;