'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Bell, Moon, Globe, Ruler, Weight, Calendar, Edit3, Save, Camera, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Warrior',
    email: 'warrior@wedxui.fit',
    age: '25',
    height: '175',
    weight: '70',
    bodyFat: '14.5',
    goal: 'Build Muscle',
    experience: 'Intermediate',
    daysPerWeek: '5',
    sessionMinutes: '60',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const stats = [
    { label: 'Workouts', value: '47', icon: Calendar },
    { label: 'Minutes', value: '2,340', icon: Clock },
    { label: 'Reps', value: '8,920', icon: Repeat },
    { label: 'XP', value: '2,450', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Profile</h2>
            <p className="text-wed-gray-400">Your character sheet. Keep it updated.</p>
          </div>
          <Button variant={isEditing ? 'glow' : 'outline'} size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2">
            {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
          </Button>
        </div>
      </motion.div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glow-purple">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-wed-purple to-wed-blue flex items-center justify-center text-4xl">
                  🥷
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-wed-surface border border-white/10 flex items-center justify-center text-wed-gray-400 hover:text-white transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-2xl font-bold text-white">{formData.name}</h3>
                <p className="text-wed-purple font-semibold">Iron Mind • Level 8</p>
                <p className="text-sm text-wed-gray-400 mt-1">{formData.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className="px-2 py-1 rounded-full text-xs bg-wed-purple/10 text-wed-purple border border-wed-purple/20">{formData.goal}</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-wed-blue/10 text-wed-blue border border-wed-blue/20">{formData.experience}</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-wed-lime/10 text-wed-lime border border-wed-lime/20">{formData.daysPerWeek} days/week</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-white">12</div>
                <div className="text-xs text-wed-gray-400">day streak</div>
                <div className="flex items-center gap-1 mt-1 justify-center">
                  <Flame className="w-4 h-4 text-wed-orange" />
                  <span className="text-xs text-wed-orange">On Fire</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <stat.icon className="w-5 h-5 text-wed-purple mx-auto mb-2" />
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-wed-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Physical Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Ruler className="w-4 h-4 text-wed-blue" /> Physical Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Age', field: 'age', unit: 'years', icon: Calendar },
                { label: 'Height', field: 'height', unit: 'cm', icon: Ruler },
                { label: 'Weight', field: 'weight', unit: 'kg', icon: Weight },
                { label: 'Body Fat', field: 'bodyFat', unit: '%', icon: Activity },
              ].map((item) => (
                <div key={item.field} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-wed-blue/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-wed-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-wed-gray-400">{item.label}</p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData[item.field as keyof typeof formData]}
                        onChange={(e) => handleChange(item.field, e.target.value)}
                        className="w-full h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white">{formData[item.field as keyof typeof formData]} <span className="text-sm font-normal text-wed-gray-400">{item.unit}</span></p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4 text-wed-purple" /> Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Notifications', desc: 'Workout reminders & achievements', icon: Bell, enabled: true },
                { label: 'Dark Mode', desc: 'Always on for WEDXUI Fit', icon: Moon, enabled: true },
                { label: 'Unit System', desc: 'Metric (kg, cm)', icon: Ruler, enabled: true },
                { label: 'Language', desc: 'English', icon: Globe, enabled: true },
                { label: 'Privacy', desc: 'Public profile', icon: Shield, enabled: false },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <setting.icon className="w-4 h-4 text-wed-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{setting.label}</p>
                      <p className="text-xs text-wed-gray-400">{setting.desc}</p>
                    </div>
                  </div>
                  <button
                    className={`w-10 h-5 rounded-full transition-all relative ${
                      setting.enabled ? 'bg-wed-purple' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      setting.enabled ? 'left-5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Level Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Level Progress</h3>
                <p className="text-sm text-wed-gray-400">2,450 / 3,000 XP to Level 9</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-wed-purple/20 text-wed-purple text-sm font-bold">Iron Mind</span>
            </div>
            <Progress value={2450} max={3000} variant="xp" />
            <div className="flex justify-between mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">47</div>
                <div className="text-xs text-wed-gray-400">Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-xs text-wed-gray-400">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-xs text-wed-gray-400">Current Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">2,340</div>
                <div className="text-xs text-wed-gray-400">Minutes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import { Flame, Activity, Clock, Repeat, Zap } from 'lucide-react';
