## Getting Started

Install Git if you haven't.

First, ``cd`` to your preferred directory and clone the repository by opening ``cmd`` and run:

```bash
git clone https://github.com/TamTonyTong/COS30049.git
```

Install ``npm`` package if you haven't:

```bash
npm install
```

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## How to navigate in the project

Here is an overview of the important files and folders in the project:

```
.
├── src/components/         # Reusable React components
├── src/app/              # Next.js pages (Where you create your webpage)
├── src/public/             # Static assets (e.g., images, fonts)
├── src/styles/             # Global and component-specific styles
├── utils/              # Helper functions and utilities
├── README.md           # Project documentation
```
### Key Folder: `app/`

The `app/` directory is where you define your application's routes.

- `app/page.tsx` → `http://localhost:3000/`
-> This will be the homepage for the website

### Creating New Pages

1. **Navigate to the `app/` folder:**
   All page files must be placed inside the `app/` directory.
   

3. **Create a new file:**
   Add a new folder in the `app/` directory. The file name will automatically become the route.
   If you want to create new webpage, create a new folder with your desire name, and place a file `page.tsx` inside.
   
5. **Add your React component:**
   Inside the newly created file, define your page as a React component:
   ```javascript
   // app/contact/page.tsx
   import React from 'react';

   const Contact = () => {
       return (
           <div>
               <h1>Contact Us</h1>
               <p>This is the contact page.</p>
           </div>
       );
   };

   export default Contact;
   ```
6. **Access your new page:**
   Start the development server (`npm run dev`) and navigate to `http://localhost:3000/contact` to view your new page.


### Adding Template Components from shadcn/ui

You can easily add pre-designed components to your project using templates from [shadcn/ui themes](https://ui.shadcn.com/themes).

#### Steps to Add a Template Component:

1. **Choose a Component:**
   Visit [shadcn/ui themes](https://ui.shadcn.com/themes) and select the desired component or theme you want to use.

2. **Add the component using CLI**
   Copy the CLI command and paste it to your cmd to automatically install the component. For example:
   ```bash
   npx shadcn@latest add alert
   ```
(Other Method)

3. **Copy the Code:**
   Copy the JSX/React code provided for the component.

4. **Create a New Component File:**
   Navigate to the `components/` directory and create a new file for the component. For example:
   ```bash
   components/Button.tsx
   ```

5. **Paste the Code:**
   Paste the copied code into the newly created file and modify it as needed. For example:
   ```javascript
   // components/Button.tsx
   import React from 'react';

   const Button = ({ children }) => {
       return (
           <button className="px-4 py-2 bg-blue-500 text-white rounded">
               {children}
           </button>
       );
   };

   export default Button;
   ```

6. **Import and Use the Component:**
   Import the new component into your pages or other components as needed:
   ```javascript
   // app/page.tsx
   import Button from '../components/Button';

   const Home = () => {
       return (
           <div>
               <h1>Welcome to the Homepage</h1>
               <Button>Click Me</Button>
           </div>
       );
   };

   export default Home;
   ```
