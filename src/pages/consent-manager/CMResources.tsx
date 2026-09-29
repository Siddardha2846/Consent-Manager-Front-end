import React from 'react';
import { Database, GraduationCap, Heart, Tag } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { ALL_FIELDS, ORGANIZATIONS } from '../../data/mockData';

// Predefined org-to-field-category mapping
const ORG_RESOURCES: Record<
  string,
  { categories: { name: string; fieldIds: string[] }[] }
> = {
  'org-college-a': {
    categories: [
      {
        name: 'Academic',
        fieldIds: ['field-student-id', 'field-name', 'field-study-cert', 'field-cgpa', 'field-program'],
      },
      {
        name: 'Personal',
        fieldIds: ['field-dob'],
      },
      {
        name: 'Contact',
        fieldIds: ['field-address', 'field-phone'],
      },
    ],
  },
  'org-college-b': {
    categories: [
      {
        name: 'Academic',
        fieldIds: ['field-student-id', 'field-name', 'field-study-cert', 'field-cgpa', 'field-program'],
      },
      {
        name: 'Personal',
        fieldIds: ['field-dob'],
      },
      {
        name: 'Contact',
        fieldIds: ['field-address', 'field-phone'],
      },
    ],
  },
  'org-hospital-a': {
    categories: [
      {
        name: 'Health',
        fieldIds: ['field-medical'],
      },
      {
        name: 'Personal',
        fieldIds: ['field-name', 'field-dob'],
      },
      {
        name: 'Insurance',
        fieldIds: ['field-insurance-id'],
      },
    ],
  },
  'org-hospital-b': {
    categories: [
      {
        name: 'Health',
        fieldIds: ['field-medical'],
      },
      {
        name: 'Personal',
        fieldIds: ['field-name', 'field-dob'],
      },
      {
        name: 'Insurance',
        fieldIds: ['field-insurance-id'],
      },
    ],
  },
};

const FIELD_MAP = Object.fromEntries(ALL_FIELDS.map((f) => [f.id, f]));

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Academic: <GraduationCap className="w-4 h-4 text-blue-500" />,
  Personal: <Tag className="w-4 h-4 text-purple-500" />,
  Contact: <Tag className="w-4 h-4 text-gray-500" />,
  Health: <Heart className="w-4 h-4 text-red-500" />,
  Insurance: <Tag className="w-4 h-4 text-amber-500" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Academic: 'bg-blue-50 text-blue-800 ring-blue-200',
  Personal: 'bg-purple-50 text-purple-800 ring-purple-200',
  Contact: 'bg-gray-100 text-gray-700 ring-gray-200',
  Health: 'bg-red-50 text-red-800 ring-red-200',
  Insurance: 'bg-amber-50 text-amber-800 ring-amber-200',
};

export default function CMResources() {
  const orgs = ORGANIZATIONS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Data Resources</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Overview of data fields available from each registered organisation.
        </p>
      </div>

      {/* Org Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orgs.map((org) => {
          const resources = ORG_RESOURCES[org.id];
          if (!resources) return null;

          const totalFields = resources.categories.reduce(
            (sum, cat) => sum + cat.fieldIds.length,
            0
          );

          return (
            <Card key={org.id}>
              {/* Org Header */}
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900">{org.name}</h2>
                  <p className="text-xs text-gray-500">{org.type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{org.contactEmail}</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200 shrink-0">
                  {totalFields} fields
                </span>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                {resources.categories.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center gap-1.5 mb-2">
                      {CATEGORY_ICONS[cat.name] ?? <Tag className="w-4 h-4 text-gray-400" />}
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.fieldIds.map((fid) => {
                        const field = FIELD_MAP[fid];
                        if (!field) return null;
                        const colorClass =
                          CATEGORY_COLORS[cat.name] ?? 'bg-gray-100 text-gray-700 ring-gray-200';
                        return (
                          <div key={fid} className="group relative">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ring-1 ring-inset cursor-default ${colorClass}`}
                            >
                              {field.name}
                            </span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 pointer-events-none">
                              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap max-w-[200px]">
                                {field.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-gray-400">
        Hover over a field tag to see its description. Field availability is subject to data principal consent.
      </p>
    </div>
  );
}
