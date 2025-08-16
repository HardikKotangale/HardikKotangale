class Solution {
    public static int gcd(int a, int b) {
        if (a == 0)
            return b;
        if (b == 0)
            return a;
        if (a == b)
            return a;

        if (a > b)
            return gcd(a - b, b);
        return gcd(a, b - a);
    }
    public String gcdOfStrings(String str1, String str2) {
        StringBuilder temp1=new StringBuilder();
        StringBuilder temp2=new StringBuilder();
        StringBuilder res= new StringBuilder();
        for(int i=0;i<str1.length();i++){
            temp1.append(str1.charAt(i));
        }
        for(int j=0;j<str2.length();j++){
            temp1.append(str2.charAt(j));
        }
        System.out.println(temp1);
        for(int i=0;i<str2.length();i++){
            temp2.append(str2.charAt(i));
        }
        for(int j=0;j<str1.length();j++){
            temp2.append(str1.charAt(j));
        }
        System.out.println(temp2);

        if(temp1.toString().equals(temp2.toString())){
            int glen=gcd(str1.length(),str2.length());
            for(int k=0;k<glen;k++){
                res.append(str1.charAt(k));
            }
        }else{
            return "";
        }

        return res.toString();

    }
}