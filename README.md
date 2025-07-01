# PostgreSQL FYI 🐘

A modern, feature-rich web application for PostgreSQL database management and querying. Built with Next.js, TypeScript, and Tailwind CSS, PostgreSQL FYI provides an intuitive interface for connecting to databases, executing queries, and managing your data.

![PostgreSQL FYI](https://img.shields.io/badge/PostgreSQL-FYI-blue?style=for-the-badge&logo=postgresql)
![Next.js](https://img.shields.io/badge/Next.js-13.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🔌 Database Connections
- **Multiple Connection Support**: Save and manage multiple PostgreSQL database connections
- **Recent Connections**: Quick access to recently used databases
- **Connection Testing**: Real-time connection status monitoring
- **Secure Storage**: Connection details stored locally with encryption support

### 📝 Advanced Query Editor
- **Monaco Editor Integration**: Full-featured SQL editor with syntax highlighting
- **Intelligent Autocomplete**: SQL keyword suggestions and smart completions
- **Keyboard Shortcuts**: 
  - `Ctrl+Enter` (or `Cmd+Enter` on Mac) to execute queries
  - `Ctrl+S` to save queries
- **Query Management**: Save, load, and organize your SQL queries
- **Export/Import**: Download queries as `.sql` files or load from files

### 📊 Data Visualization & Management
- **Interactive Tables**: Sortable, filterable data tables with infinite scroll
- **Advanced Filtering**: Global search and column-specific filters
- **Data Export**: Export query results to CSV format
- **Row Actions**: Copy individual rows or export as CSV
- **Responsive Design**: Optimized for desktop and mobile viewing

### 🗂️ Database Schema Explorer
- **Visual Schema Browser**: Explore tables, columns, and data types
- **Table Navigation**: Click any table to view its data instantly
- **Column Details**: View column types, constraints, and default values
- **Real-time Updates**: Schema refreshes automatically when structure changes

### 🎨 Modern UI/UX
- **Dark/Light Theme**: System-aware theme switching
- **Responsive Layout**: Collapsible sidebar and adaptive layouts
- **Loading States**: Smooth loading animations and skeleton screens
- **Error Handling**: Comprehensive error messages and recovery options
- **Accessibility**: Full keyboard navigation and screen reader support

### ⚡ Performance Features
- **Infinite Scroll**: Load large datasets efficiently
- **Query Caching**: Smart caching for improved performance
- **Lazy Loading**: Components load on demand
- **Optimized Rendering**: Virtual scrolling for large tables

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **PostgreSQL FYI Service** running on your system

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/postgresql-fyi-web.git
   cd postgresql-fyi-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### PostgreSQL FYI Service Setup

The web application requires the PostgreSQL FYI service to be running. Follow the installation guide:

1. **Quick Install** (Linux/macOS)
   ```bash
   curl -sSL https://raw.githubusercontent.com/AkbarHabeeb/postgresql-fyi-e2e/main/remote-install.sh | bash
   ```

2. **Verify Installation**
   The service should be running on `http://localhost:6240`

3. **Test Connection**
   Visit the "Get Started" page in the application for detailed setup instructions.

## 📖 Usage Guide

### Creating Your First Connection

1. **Navigate to Connections**
   - Click "New Connection" in the sidebar
   - Or visit the Connections page directly

2. **Enter Database Details**
   ```
   Host: localhost (or your database host)
   Port: 5432 (default PostgreSQL port)
   Database: your_database_name
   Username: your_username
   Password: your_password
   ```

3. **Test & Save**
   - Click "Connect to Database" to test the connection
   - Optionally save the connection for future use

### Writing and Executing Queries

1. **Open Query Editor**
   - Navigate to the Query page after connecting
   - The Monaco editor provides full SQL support

2. **Write Your Query**
   ```sql
   SELECT * FROM users 
   WHERE created_at > '2024-01-01'
   ORDER BY created_at DESC
   LIMIT 100;
   ```

3. **Execute Query**
   - Press `Ctrl+Enter` (or `Cmd+Enter` on Mac)
   - Or click the "Run Query" button
   - Results appear in the table below

### Managing Saved Queries

1. **Save a Query**
   - Write your SQL query
   - Click "Save Query" or press `Ctrl+S`
   - Give it a descriptive name

2. **Load Saved Queries**
   - Browse saved queries in the sidebar
   - Click any query to load it into the editor
   - Use the search function to find specific queries

3. **Export/Import Queries**
   - Download individual queries as `.sql` files
   - Export all queries at once
   - Import queries from `.sql` files

### Exploring Database Schema

1. **View Tables**
   - Expand the "Database Schema" section in the sidebar
   - See all tables in your connected database

2. **Explore Table Structure**
   - Click the arrow next to any table name
   - View columns, data types, and constraints

3. **View Table Data**
   - Click on any table name to navigate to the table view
   - Browse data with sorting and filtering options

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` / `Cmd+Enter` | Execute query |
| `Ctrl+S` / `Cmd+S` | Save current query |
| `Ctrl+/` / `Cmd+/` | Toggle comment |
| `F11` | Toggle fullscreen |
| `Esc` | Close dialogs/modals |

## 🛠️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# PostgreSQL FYI Service URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:6240

# Optional: Custom port for development
PORT=3000
```

### Customization

The application supports extensive customization through:

- **Themes**: Modify `app/globals.css` for custom color schemes
- **Components**: All UI components are in the `components/` directory
- **Layouts**: Responsive layouts can be adjusted in `components/layout/`

## 🏗️ Architecture

### Tech Stack

- **Frontend Framework**: Next.js 13.5 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: React hooks and local storage
- **Code Editor**: Monaco Editor (VS Code editor)
- **Icons**: Lucide React icon library
- **HTTP Client**: Axios with interceptors

### Project Structure

```
postgresql-fyi-web/
├── app/                    # Next.js app directory
│   ├── connections/        # Database connections page
│   ├── query/             # SQL query editor page
│   ├── table/             # Table data viewer page
│   ├── get-started/       # Setup guide page
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── layout/           # Layout components
│   └── ...               # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── providers/            # React context providers
└── utils/                # Helper utilities
```

### Key Components

- **AppLayout**: Main application layout with sidebar and content area
- **ConnectionsSidebar**: Collapsible sidebar with navigation and schema
- **ResizableSqlEditor**: Advanced SQL editor with Monaco integration
- **DatabaseSchemaSection**: Interactive database schema explorer
- **SavedQueriesSection**: Query management and search functionality

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Code Quality

The project includes:

- **ESLint**: Code linting with Next.js recommended rules
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting (configure in your editor)
- **Husky**: Git hooks for pre-commit checks (optional)

### Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

## 🐛 Troubleshooting

### Common Issues

#### Connection Failed
- **Check Service**: Ensure PostgreSQL FYI service is running on port 6240
- **Firewall**: Verify firewall settings allow connections
- **Credentials**: Double-check database credentials

#### Query Editor Not Responding
- **Browser Compatibility**: Use a modern browser (Chrome, Firefox, Safari, Edge)
- **JavaScript**: Ensure JavaScript is enabled
- **Console Errors**: Check browser console for error messages

#### Performance Issues
- **Large Datasets**: Use LIMIT clauses for large queries
- **Browser Memory**: Close unused tabs to free memory
- **Network**: Check network connection stability

### Getting Help

1. **Check the Get Started Guide**: Built-in setup instructions
2. **Browser Console**: Look for error messages
3. **GitHub Issues**: Report bugs or request features
4. **Documentation**: Refer to this README and inline comments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

- **Balaguru Nilacandane** - [LinkedIn](https://www.linkedin.com/in/balagurunilacandane/)
- **Akbar Habeeb B** - [LinkedIn](https://www.linkedin.com/in/akbarhabeebb/)

## 🙏 Acknowledgments

- **PostgreSQL Community** for the amazing database system
- **Next.js Team** for the excellent React framework
- **Radix UI** for accessible component primitives
- **Monaco Editor** for the powerful code editor
- **Tailwind CSS** for the utility-first CSS framework

## 🔮 Roadmap

### Upcoming Features

- [ ] **Query History**: Track and replay previous queries
- [ ] **Data Visualization**: Charts and graphs for query results
- [ ] **Multi-tab Editor**: Work with multiple queries simultaneously
- [ ] **Database Migrations**: Visual migration management
- [ ] **User Authentication**: Multi-user support with permissions
- [ ] **Query Performance**: Execution time analysis and optimization tips
- [ ] **Export Formats**: Support for JSON, XML, and Excel exports
- [ ] **Real-time Collaboration**: Share queries and results with team members

### Long-term Goals

- **Cloud Deployment**: One-click deployment to major cloud providers
- **Plugin System**: Extensible architecture for custom features
- **Mobile App**: Native mobile applications for iOS and Android
- **Enterprise Features**: Advanced security, audit logs, and compliance tools

---

**Made with ❤️ for the PostgreSQL community**

For more information, visit our [GitHub repository](https://github.com/your-username/postgresql-fyi-web) or check out the [live demo](https://postgresql-fyi.demo.com).