# PostgreSQL FYI 🐘

A modern, feature-rich web application for PostgreSQL database management and querying.

## ✨ Features

### 🔌 Database Connections
- **Multiple Connection Support**: Save and manage multiple PostgreSQL database connections with custom names and color coding
- **Recent Connections**: Quick access to recently used databases with automatic history tracking
- **Connection Testing**: Real-time connection status monitoring and validation
- **Secure Storage**: Connection details stored locally in browser storage
- **Connection Management**: Edit, delete, and organize saved connections

### 📝 Advanced Query Editor
- **Monaco Editor Integration**: Full-featured SQL editor with syntax highlighting and IntelliSense
- **Intelligent Autocomplete**: SQL keyword suggestions, table names, and column completions
- **Keyboard Shortcuts**: 
  - `Ctrl+Enter` (or `Cmd+Enter` on Mac) to execute queries instantly
  - `Ctrl+S` to save queries with custom names
  - Standard editor shortcuts for copy, paste, undo, redo
- **Query Management**: Save, load, search, and organize your SQL queries
- **Export/Import**: Download queries as `.sql` files or load from existing files
- **Query History**: Access previously executed queries
- **Format Query**: Auto-format SQL code for better readability

### 📊 Data Visualization & Management
- **Interactive Tables**: Sortable, filterable data tables with smooth scrolling
- **Advanced Filtering**: Global search across all columns and column-specific filters
- **Infinite Scroll**: Efficiently load large datasets with automatic pagination
- **Data Export**: Export query results to CSV format with proper formatting
- **Row Actions**: Copy individual rows, export selections, or view raw data
- **Responsive Design**: Optimized viewing experience across desktop, tablet, and mobile devices
- **Column Management**: Show/hide columns, resize, and reorder table columns

### 🗂️ Database Schema Explorer
- **Visual Schema Browser**: Interactive tree view of all database tables and structures
- **Table Navigation**: Click any table name to instantly view its data
- **Column Details**: View column types, constraints, nullable status, and default values
- **Schema Search**: Find tables and columns quickly with built-in search
- **Real-time Updates**: Schema automatically refreshes when database structure changes
- **Expandable Views**: Collapse/expand table details to focus on relevant information

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Automatic system theme detection with manual override options
- **Responsive Layout**: Collapsible sidebar that adapts to screen size
- **Loading States**: Smooth loading animations, skeleton screens, and progress indicators
- **Error Handling**: Comprehensive error messages with suggested solutions
- **Accessibility**: Full keyboard navigation, screen reader support, and ARIA labels
- **Toast Notifications**: Non-intrusive success, error, and info messages
- **Glass Morphism**: Modern translucent design elements with backdrop blur effects

### ⚡ Performance Features
- **Lazy Loading**: Components and data load on demand to improve initial page load
- **Query Caching**: Smart caching mechanisms for frequently accessed data
- **Optimized Rendering**: Virtual scrolling for large datasets to maintain smooth performance
- **Debounced Search**: Intelligent search with debouncing to reduce server requests
- **Connection Pooling**: Efficient database connection management
- **Memory Management**: Automatic cleanup of unused resources and components

### 🔧 Advanced Features
- **Resizable Panels**: Drag to resize query editor and results sections
- **Multi-tab Support**: Work with multiple database connections simultaneously
- **Query Validation**: Real-time SQL syntax checking and error highlighting
- **Auto-save**: Automatically save work in progress to prevent data loss
- **Keyboard Navigation**: Complete application control via keyboard shortcuts
- **Context Menus**: Right-click menus for quick access to common actions
- **Drag & Drop**: Drag files to import queries or export results

### 🛡️ Security & Reliability
- **Local Storage**: All sensitive data stored locally in browser, never transmitted to external servers
- **Connection Encryption**: Secure SSL/TLS connections to databases
- **Input Validation**: Comprehensive validation to prevent SQL injection and other attacks
- **Error Boundaries**: Graceful error handling that prevents application crashes
- **Backup & Restore**: Export/import application settings and saved queries
- **Session Management**: Automatic session handling with reconnection capabilities